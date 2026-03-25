import React from 'react';

import { Link, Outlet } from 'react-router-dom';



const BaseLayout: React.FC = () => {

  return (

    <div className="min-h-screen bg-gray-50">

      <header className="bg-white shadow-sm">

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between h-16">

            <div className="flex">

              <Link to="/" className="flex items-center">

                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />

              </Link>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">

                <Link 

                  to="/" 

                  className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"

                >

                  Home

                </Link>

                <Link 

                  to="/dashboard" 

                  className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300"

                >

                  Dashboard

                </Link>

              </div>

            </div>

            <div className="flex items-center">

              <Link 

                to="/signin" 

                className="text-gray-900 hover:text-gray-700 px-3 py-2"

              >

                Sign In

              </Link>

              <Link 

                to="/signup"

                className="ml-4 px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"

              >

                Sign Up

              </Link>

            </div>

          </div>

        </nav>

      </header>



      <main>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

          <Outlet />

        </div>

      </main>



      <footer className="bg-white mt-auto">

        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

          <p className="text-center text-gray-500">

            © {new Date().getFullYear()} Your Application. All rights reserved.

          </p>

        </div>

      </footer>

    </div>

  );

};



export default BaseLayout;