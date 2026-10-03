# WinLanka Apparel Inventory Management System

A full-stack inventory management system developed for **WinLanka Apparel** to manage users, stock items, goods received, dispatch notes, and inventory levels through a role-based web application.

The system is built using **ASP.NET Core / Azure Functions, React, Microsoft SQL Server, and JWT-based authentication**, with a focus on clean architecture, role-based authorization, RESTful APIs, and a professional management dashboard.

---

## 📌 Project Overview

The WinLanka Apparel Inventory Management System provides a centralized platform for managing apparel inventory and stock movements.

The application supports different operational roles and provides each role with access to the features required for their responsibilities.

The system allows authorized users to:

* Manage system users and their scopes
* Manage stock items
* Record Goods Received Notes (GRNs)
* Record Dispatch Notes (DNs)
* Track received and dispatched quantities
* Monitor current stock availability
* Configure reorder levels
* Identify low-stock items
* View inventory analytics and stock movement information

The frontend communicates with backend Azure Functions through REST APIs.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-based authorization
* Secure API access using Bearer tokens
* User activation/deactivation
* Multiple scopes can be assigned to a user
* Role-specific navigation and functionality

### 👥 User Management

Administrators can:

* Add users
* Edit users
* Activate/deactivate users
* Assign multiple scopes
* View user information
* View user access levels

Supported scopes:

* **Admin**
* **Storekeeper**
* **Stock Manager**

Passwords are not displayed when viewing or editing an existing user.

---

### 📦 Stock Item Management

Storekeepers and Stock Managers can view stock items including:

* Stock Item ID
* Stock Name
* Category
* Unit
* Reorder Level

Storekeepers can add new stock items.

Supported units include:

* Pieces
* Centimeters
* Meters

---

### 📥 Goods Received Notes

Storekeepers can record incoming stock using Goods Received Notes.

Each GRN can contain:

* GRN ID
* Supplier
* Date
* Multiple stock items
* Quantity received for each item

The GRN Summary page also provides inventory insights such as:

* Total GRNs
* Total quantity received
* Supplier activity
* Quantity by unit
* Recent GRN activity

---

### 📤 Dispatch Notes

Storekeepers can create Dispatch Notes for outgoing stock.

Each Dispatch Note contains:

* Dispatch Note ID
* Customer
* Date
* Multiple stock items
* Quantity dispatched for each item

The Dispatch Note Summary provides information such as:

* Total dispatch notes
* Total quantity dispatched
* Customer activity
* Quantity by unit
* Recent dispatch activity

---

### 📊 Stock Summary & Inventory Analytics

The Stock Summary page provides a centralized view of the current inventory position.

It tracks:

* Total received quantity
* Total dispatched quantity
* Available quantity
* Reorder level
* Stock health
* Low-stock items
* Stock movement
* Restocking priorities

The dashboard dynamically generates analytics from the actual inventory data returned by the backend.

Examples include:

* Inventory health overview
* Received vs dispatched comparison
* Highest available stock
* Most dispatched stock
* Restocking priority
* Low-stock alerts

No static or dummy inventory statistics are used.

---

## 👤 User Roles

| Feature             | Admin | Storekeeper | Stock Manager |
| ------------------- | :---: | :---------: | :-----------: |
| Manage Users        |   ✅   |      ❌      |       ❌       |
| View Stock Items    |   ❌   |      ✅      |       ✅       |
| Add Stock Items     |   ❌   |      ✅      |       ❌       |
| View GRNs           |   ❌   |      ✅      |       ✅       |
| Add GRNs            |   ❌   |      ✅      |       ❌       |
| View Dispatch Notes |   ❌   |      ✅      |       ✅       |
| Add Dispatch Notes  |   ❌   |      ✅      |       ❌       |
| View Stock Summary  |   ❌   |      ✅      |       ✅       |
| Edit Reorder Level  |   ❌   |      ✅      |       ❌       |

> Authorization is enforced through the application's authentication and role-based access mechanisms.

---

## 🏗️ System Architecture

The application follows a frontend/API/database architecture.

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│  React + Vite + JavaScript  │
│  Tailwind / CSS              │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│     Azure Functions         │
│                             │
│   WinLanka.Users            │
│   WinLanka.Inventory        │
└──────────────┬──────────────┘
               │
               │ Data Access
               ▼
┌─────────────────────────────┐
│       SQL Server            │
│                             │
│        WinLankaDB           │
└─────────────────────────────┘
```

### Main Components

#### Frontend

`WinLanka.Client`

Responsible for:

* User interface
* Navigation
* Authentication state
* Role-based UI
* API communication
* Inventory dashboards
* Forms and validation
* Tables and modals

#### User API

`WinLanka.Users`

Responsible for functionality related to:

* Authentication
* JWT token generation
* User management
* User updates
* Authorization

#### Inventory API

`WinLanka.Inventory`

Responsible for:

* Stock items
* Goods Received Notes
* Dispatch Notes
* Stock Summary
* Inventory calculations
* Reorder-level updates

#### Database

`WinLankaDB`

Microsoft SQL Server database used to persist application data.

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* HTML5
* CSS3
* Tailwind CSS
* Lucide React

### Backend

* C#
* .NET
* Azure Functions
* HTTP APIs
* JWT Authentication
* RESTful API architecture

### Database

* Microsoft SQL Server
* SQL Server Express
* Entity Framework / database access layer

### Development Tools

* Visual Studio
* Visual Studio Code
* SQL Server Management Studio
* Git
* GitHub
* Node.js
* npm

---

## 📁 Project Structure

A simplified structure of the solution is:

```text
WinLankaApparelInventory/
│
├── WinLanka.Client/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── WinLanka.Users/
│   │
│   ├── Functions/
│   ├── Models/
│   ├── Services/
│   └── ...
│
├── WinLanka.Inventory/
│   │
│   ├── Functions/
│   ├── Models/
│   ├── Services/
│   └── ...
│
└── README.md
```

> The exact folder structure may vary depending on the current implementation of each project.

---

## 🔑 Authentication Flow

The application uses JWT-based authentication.

The general authentication flow is:

```text
User
 │
 ▼
React Login Page
 │
 ▼
WinLanka.Users API
 │
 ▼
Credentials Validation
 │
 ▼
JWT Token Generated
 │
 ▼
Token Stored by Frontend
 │
 ▼
Bearer Token Sent with API Requests
 │
 ▼
Backend Validates Token & Role
 │
 ▼
Authorized API Operation
```

The JWT contains the user's identity and role information, which is used to control access to protected functionality.

---

## 📊 Inventory Flow

The inventory system maintains stock movement through receiving and dispatch operations.

```text
             ┌─────────────────┐
             │   Stock Item    │
             └────────┬────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
 ┌─────────────────┐     ┌─────────────────┐
 │ Goods Received  │     │ Dispatch Note   │
 │      (GRN)      │     │      (DN)       │
 └────────┬────────┘     └────────┬────────┘
          │                       │
          ▼                       ▼
    Total Received          Total Dispatched
          │                       │
          └───────────┬───────────┘
                      ▼
              ┌───────────────┐
              │ Stock Summary │
              └───────┬───────┘
                      │
                      ▼
             Available Quantity
                      │
                      ▼
               Reorder Level
                      │
             ┌────────┴────────┐
             │                 │
          Healthy           Low Stock
             │                 │
             │                 ▼
             │          Restocking Alert
             │
             ▼
       Inventory Dashboard
```

---

## 📈 Dashboard & Analytics

The application includes dashboard-style analytics throughout the inventory management pages.

### User Dashboard

Displays:

* Total users
* Active users
* Inactive users
* Administrators
* Role distribution
* Active/inactive distribution

### Stock Item Dashboard

Displays:

* Total stock items
* Categories
* Units
* Reorder-level configuration
* Category distribution

### GRN Dashboard

Displays:

* Total GRNs
* Total received quantity
* Supplier activity
* Quantity by unit
* Recent GRN activity

### Dispatch Dashboard

Displays:

* Total dispatch notes
* Total dispatched quantity
* Customer activity
* Quantity by unit
* Recent dispatch activity

### Stock Summary Dashboard

Displays:

* Inventory health
* Total received
* Total dispatched
* Available inventory
* Highest available stock
* Most dispatched stock
* Low-stock items
* Restocking priorities

All dashboard statistics are calculated from API responses.

---

## 🚨 Low Stock Management

The system automatically identifies stock that has fallen below its configured reorder level.

The basic condition is:

```text
Available Quantity < Reorder Level
```

When this condition is met:

* The stock item is marked as **Low Stock**
* A low-stock alert can be displayed
* Storekeepers can update the reorder level
* The item appears in the restocking-priority section

The restocking priority also calculates the stock shortage:

```text
Shortage = Reorder Level - Available Quantity
```

This helps users identify items requiring greater attention.

---

## 🔄 API Configuration

The frontend uses environment variables to configure the backend API endpoints.

Example:

```env
VITE_API_BASE_URL=http://localhost:7165/api
VITE_INVENTORY_API_BASE_URL=http://localhost:7239/api
```

For production, these values should be changed to the deployed API endpoints.

> Do not commit production secrets, database passwords, private keys, or other sensitive credentials to GitHub.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* .NET SDK
* SQL Server / SQL Server Express
* SQL Server Management Studio
* Git

---

### 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

Navigate into the project:

```bash
cd WinLankaApparelInventory
```

---

### 2. Configure the Database

Create a SQL Server database named:

```text
WinLankaDB
```

Update the database connection string according to your local SQL Server configuration.

Example:

```text
Server=YOUR_SERVER;
Database=WinLankaDB;
Trusted_Connection=True;
TrustServerCertificate=True;
```

---

### 3. Configure Frontend Environment Variables

Inside the React project, create:

```text
.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:7165/api
VITE_INVENTORY_API_BASE_URL=http://localhost:7239/api
```

---

### 4. Install Frontend Dependencies

Navigate to the client:

```bash
cd WinLanka.Client
```

Install dependencies:

```bash
npm install
```

---

### 5. Start the React Application

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

### 6. Run the Backend APIs

Start the following backend projects:

```text
WinLanka.Users
WinLanka.Inventory
```

Make sure the configured ports match the frontend environment variables.

---

## 🔒 Security Considerations

The project implements several security-related practices:

* JWT-based authentication
* Role-based authorization
* Protected API endpoints
* Bearer token authentication
* User activation control
* Separation of user and inventory APIs
* Passwords are not exposed in user-view/edit interfaces
* Database credentials are kept outside source code where possible

For production deployment, additional security measures should be applied, including:

* HTTPS
* Secure secret management
* Azure Key Vault or equivalent secret storage
* Production database security
* Token expiration and refresh policies
* Proper CORS configuration
* Application monitoring and logging
* Environment-specific configuration

---

## 🧪 Testing

The system can be tested by performing the following operations:

### Authentication

* Login with valid credentials
* Login with invalid credentials
* Verify role-based access
* Verify inactive users cannot access protected functionality

### User Management

* Create users
* Update users
* Change user scopes
* Activate/deactivate users

### Inventory

* Add stock items
* Create GRNs
* Create Dispatch Notes
* Verify stock quantities
* Verify low-stock detection
* Update reorder levels

### Authorization

Verify that:

* Admin functionality is restricted to administrators
* Storekeeper operations are restricted appropriately
* Stock Manager functionality remains view-oriented

---

## 🎯 Project Objectives

The main objectives of this project are to:

1. Develop a centralized apparel inventory management system.
2. Implement role-based access control.
3. Provide reliable stock movement tracking.
4. Maintain accurate inventory availability.
5. Identify stock requiring replenishment.
6. Provide useful inventory analytics.
7. Separate frontend and backend responsibilities.
8. Build REST-based APIs using Azure Functions.
9. Apply clean and maintainable software development practices.
10. Provide a responsive and professional management interface.

---

## 📚 Learning Outcomes

This project provides practical experience in:

* React application development
* REST API integration
* ASP.NET / C# development
* Azure Functions
* JWT authentication
* Role-based authorization
* SQL Server database development
* API service abstraction
* Inventory management concepts
* State management in React
* Form validation
* Dashboard development
* Git and GitHub workflow
* Full-stack application architecture

---

## 🔮 Future Improvements

Potential future enhancements include:

* Production deployment using Azure
* Azure API Management
* Azure Key Vault integration
* Application Insights monitoring
* Automated testing
* Advanced inventory forecasting
* Exporting inventory reports
* PDF/Excel reporting
* Audit logs
* More detailed inventory history
* Improved notification mechanisms
* Advanced search and filtering
* Automated deployment using CI/CD

---

## 👨‍💻 Author

**Vaidhesh Balakrishnan**

BEng (Hons) Software Engineering

GitHub: **VaidheshB**

---

## 📄 Project Status

**Status:** Completed / Development Project

The project is actively maintained as a full-stack inventory management application and can be extended for production deployment and additional enterprise features.

---

## ⭐ Technologies at a Glance

```text
Frontend        → React + Vite + JavaScript
Backend         → C# + .NET + Azure Functions
Authentication  → JWT
Database        → Microsoft SQL Server
UI              → CSS + Tailwind CSS
Icons           → Lucide React
Version Control → Git + GitHub
Development     → Visual Studio + VS Code
```
