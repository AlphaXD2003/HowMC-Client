import App from "@/App"
import Test from "@/pages/Test"

import  Layout  from "@/layout/Layout"
import Home from "@/pages/Home"

export interface Route{
    path: string
    element: React.ReactNode,
    children?: Route[]
}

export const mainRouter: Route[] = [
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '',
                element: <Home />
            },
            {
                path: 'test',
                element: <Test />
            }
        ]
    }
]