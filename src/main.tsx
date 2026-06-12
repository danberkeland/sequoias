import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from "aws-amplify";
import { BrowserRouter } from "react-router-dom";
import outputs from "../amplify_outputs.json";
import AppRoutes from "./AppRoutes";

Amplify.configure(outputs);

const formFields = {
  signUp: {
    email: {
      order: 1,
    },
    family_name: {
      label: 'Family Name',
      placeholder: 'Enter your family name',
      isRequired: true,
      order: 2,
    },
    password: {
      order: 3,
    },
    confirm_password: {
      order: 4,
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(

  <React.StrictMode>
    <Authenticator
      signUpAttributes={['family_name']}
      formFields={formFields}
    >
      <BrowserRouter> 
        <AppRoutes />
      </BrowserRouter>
    </Authenticator>
  </React.StrictMode>
);
