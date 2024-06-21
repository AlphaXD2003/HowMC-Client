const { ApiErrors } = require("../utils/ApiErrors");
const { ApiResponse } = require("../utils/ApiResponse");
const apiUrl = `${process.env.PTEORDACTYL_URL}/api/application/servers`;
const { PTEORDACTYL_KEY } = process.env;
const {
  updatePteroServer,
  getServerDetails: getServer,
  deletePteroServer: deleteServer,
  createPteroServer,
} = require("../utils/PteroServer");
const headers = {
  Authorization: `Bearer ${PTEORDACTYL_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};
const {Server} = require("../models/");

const createServer = async (req, res) => {
  const {
    name,
    user,
    eggInfo, // need it for the detecting which game it is
    docker_image,
    startup,
    limits,
    environment,
    feature_limits,
    allocation,
    deploy,
    description,
    cost
  } = req.body;
  try {
    if (
      [name, user, eggInfo, docker_image, startup, limits, environment].some(
        (value) => value === undefined || ""
      )
    ) {
      throw new ApiErrors(400, "Missing required fields");
    }
    if (
      !feature_limits.databases &&
      !feature_limits.allocatins &&
      !feature_limits.backups
    ) {
      throw new ApiErrors(400, "Invalid feature limits");
    }
    const body = {
      name,
      user,
      egg: eggInfo,
      docker_image,
      startup,
      limits,
      environment,
      feature_limits,
      allocation,
      deploy,
      description,
    };

    const [pteroRes, pteroError] = await createPteroServer(body);
    if (pteroError) {
      throw new ApiErrors(400, pteroError.message);
    }

    
    // Save the server in the database
    await Server.create({
      server_id: pteroRes.data.attributes.id,
      server_name: name,
      server_description: description,
      cost,
      serverInfo: {
        cpu: limits.cpu,
        ram: limits.memory,
        disk: limits.disk,
        backups: feature_limits.backups,
        location: deploy.locations[0],
        node: pteroRes.data.attributes.node,
        egg: eggInfo,
        status: "not suspended",
      },
      user_id: user,
      location: deploy.locations[0],
      node: pteroRes.data.attributes.node,
    })

    res.status(200).json(new ApiResponse(200, pteroRes));
  } catch (error) {
    console.error(error);
    res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const getServerDetails = async (req, res) => {
  const serverId = req.params.id;
  try {
    const [pteroRes, pteroError] = await getServer(serverId);
    if (pteroError) {
      throw new ApiErrors(400, pteroError.message);
    }
    res.status(200).json(new ApiResponse(200, pteroRes));
  } catch (error) {
    console.error(error);
    res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const updateServer = async (req, res) => {
  const severId = req.params.id;
  const { allocation, memory, swap, disk, io, cpu, feature_limits, threads } =
    req.body;
  if (
    [allocation, memory, swap, disk, io, cpu, threads].some(
      (value) => value === undefined
    )
  ) {
    throw new ApiErrors(400, "Missing required fields");
  }
  if (
    !feature_limits.databases &&
    !feature_limits.allocatins &&
    !feature_limits.backups
  ) {
    throw new ApiErrors(400, "Invalid feature limits");
  }
  const body = {
    allocation,
    memory,
    swap,
    disk,
    io,
    cpu,
    feature_limits,
    threads,
  };
  try {
    const [pteroRes, pteroError] = await updatePteroServer(severId, body);
    if (pteroError) {
      throw new ApiErrors(400, pteroError.message);
    }
    // update the database
    const server = await Server.findOneAndUpdate(
      { server_id: severId },
      {
        serverInfo: {
          cpu,
          ram: memory,
          disk,
          backups: feature_limits.backups,
          databases: feature_limits.databases,
          ports: feature_limits.allocations,
        },
      }
    );

    // update the database
    await Server.findOneAndUpdate(
      { server_id: severId },
      {
        serverInfo: {
          cpu,
          ram: memory,
          disk,
          backups: feature_limits.backups,
          databases: feature_limits.databases,
          ports: feature_limits.allocations,
        },
      }
    );

    return res.status(200).json(new ApiResponse(200, pteroRes));
  } catch (error) {
    console.error(error);
    res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const deletePteroServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    const [pteroRes, pteroError] = await deleteServer(serverId);
    if (pteroError) {
      throw new ApiErrors(400, pteroError.message);
    }
    // delete from database
    await Server.findOneAndDelete({ server_id: serverId });
    return res.status(200).json(new ApiResponse(200, pteroRes));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const updateServerDetails = async (req, res) => {
  const serverId = req.params.id;
  const { name, user, external_id, description } = req.body;
  if (
    [name, user, external_id, description].some((value) => value === undefined)
  ) {
    throw new ApiErrors(400, "Missing required fields");
  }
  const body = {
    name,
    user,
    external_id,
    description,
  };
  try {
    const pteroRes = await axios.patch(`${apiUrl}/${serverId}/details`, body, {
      headers,
    });

    // update the database
    await Server.findOneAndUpdate(
      { server_id: serverId },
      {
        server_name: name,
        server_description: description,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data, "Server updated"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const updateServerStartup = async (req, res) => {
  const serverId = req.params.id;
  const { startup, environment, egg, image, skip_scripts } = req.body;
  if (startup === undefined) {
    throw new ApiErrors(400, "Missing required fields");
  }
  const body = {
    startup,
    environment,
    egg,
    image,
    skip_scripts,
  };
  try {
    const pteroRes = await axios.patch(`${apiUrl}/${serverId}/startup`, body, {
      headers,
    });

    // update the database
    await Server.findOneAndUpdate(
      { server_id: serverId },
      {
        serverInfo: {
          egg,
        },
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data, "Server updated"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const suspendServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    const pteroRes = await axios.post(
      `${apiUrl}/${serverId}/suspend`,
      {},
      {
        headers,
      }
    );

    // update the database
    await Server.findOneAndUpdate(
      { server_id: serverId },
      {
        serverInfo: {
          status: "suspended",
        },
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data, "Server suspended"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const unsuspendServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    const pteroRes = await axios.post(
      `${apiUrl}/${serverId}/unsuspend`,
      {},
      {
        headers,
      }
    );
    // update the database
    await Server.findOneAndUpdate(
      { server_id: serverId },
      {
        serverInfo: {
          status: "not suspended",
        },
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data, "Server unsuspended"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const reinstallServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    const pteroRes = await axios.post(
      `${apiUrl}/${serverId}/reinstall`,
      {},
      {
        headers,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data, "Server reinstalled"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const forceDeleteServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    await axios.delete(`${apiUrl}/${serverId}/force`, {
      headers,
    });
    // delete from database
    await Server.findOneAndDelete({ server_id: serverId });
    return res.status(200).json(new ApiResponse(200, true, "Server deleted"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const renewServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    // renew the server
    await Server.findOneAndUpdate(
      { server_id: serverId },
      {
        serverInfo: {
          lastRenewed: Date.now(),
          status: "not suspended",
        },
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data, "Server renewed"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const getDatabasesOfServer = async (req, res) => {
  const serverId = req.params.id;
  try {
    const pteroRes = await axios.get(
      `${apiUrl}/${serverId}/databases?include=password,host`,
      {
        headers,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data.data, "Server databases"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const getDatabaseDetails = async (req, res) => {
  const { server_id, database_id } = req.params;
  try {
    const pteroRes = await axios.get(
      `${apiUrl}/${server_id}/databases/${database_id}?include=password,host`,
      {
        headers,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data.attributes, "Database details"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const createDatabase = async (req, res) => {
  const serverId = req.params.id;
  const { database, remote, host } = req.body;
  try {
    if ([database, remote, host].some((value) => value === undefined)) {
      throw new ApiErrors(400, "Missing required fields");
    }
    const body = {
      database,
      remote,
      host,
    };
    const pteroRes = await axios.post(`${apiUrl}/${serverId}/databases`, body, {
      headers,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, pteroRes.data.attributes, "Database created"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
};

const deleteDatabase = async (req, res) => {
  const { server_id, database_id } = req.params;
  try {
    await axios.delete(`${apiUrl}/${server_id}/databases/${database_id}`, {
      headers,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, true, "Database deleted successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }
}

const resetPassword = async (req, res) => {
  const { server_id, database_id } = req.params;
  try {
   await axios.post(
      `${apiUrl}/${server_id}/databases/${database_id}/reset-password`,
      {},
      {
        headers,
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, true, "Password reset"));
  } catch (error) {
    console.error(error);
    return res
      .status(error.status || 500)
      .json(
        new ApiResponse(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
  }

}

module.exports = {
  updateServer,
  getServerDetails,
  deletePteroServer,
  createServer,
  updateServerDetails,
  updateServerStartup,
  suspendServer,
  unsuspendServer,
  reinstallServer,
  forceDeleteServer,
  renewServer,
  getDatabasesOfServer,
  getDatabaseDetails,
  createDatabase,
  deleteDatabase,
  resetPassword,
  
};
