
## ![FinTrack Logo](https://github.com/prince-2003/FinTrack/blob/main/public/src/logo.svg)

##Hosted Link: [https://FinTrack.onrender.com](https://fintrack-6zz7.onrender.com/)

## Overview

FinTrack is a financial tracking and management tool designed to help users monitor their income, expenses, investments, and savings. The application provides an intuitive interface, detailed reports, and powerful analytics to help you take control of your financial health.

## Features

- **Expense Tracking:** Categorize and track your daily expenses.
- **Income Management:** Record and manage your sources of income.
- **Investment Portfolio:** Monitor your investments and assess performance.
- **Savings Goals:** Set and track progress towards your savings goals.
- **Detailed Reports:** Generate reports to analyze your financial situation over time.
- **Data Import/Export:** Easily import and export your financial data.

## Installation

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine
- PostgreSQL installed and running on your machine
- Git installed on your machine
- A code editor (such as VS Code)

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/prince-2003/FinTrack.git
    cd FinTrack
    ```

2. Install the required packages:

    ```bash
    npm install
    ```

3. Set up the PostgreSQL database:

    - Create a PostgreSQL database:

      ```sql
      CREATE DATABASE fintrack;
      ```

    - Create a `.env` file in the root directory and configure the following environment variables:

      ```env
      DB_HOST=localhost
      DB_USER=your-username
      DB_PASSWORD=your-password
      DB_NAME=fintrack
      DB_PORT=5432
      PORT=3000
      ```
4. Start the application:

    ```bash
    npm start
    ```

5. Open your web browser and go to `http://localhost:3000/` to start using FinTrack.

## Usage

### Dashboard

The dashboard provides an overview of your financial health, showing key metrics such as total income, total expenses, and net savings.

### Adding Transactions

You can add income or expense transactions from the 'Add Transaction' section. Categorize each transaction to better organize your finances.

### Pie Chart

Generate pie chart to visulaise your expense section. Filter by category to get insights into your spending and saving habits.

### Transaction History

Use the 'Transaction History' section to view your transactions. Add details of each transactions and monitor your expenses.

### Saving Goals

Set up and track your saving goals in the 'Savings' section. The application will show your progress and help you stay on track.


## Contributing

We welcome contributions to FinTrack! Here's how you can help:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a pull request.

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Node.js](https://nodejs.org/) - The runtime used for this project.
- [Express.js](https://expressjs.com/) - The web framework used for building the server.
- [PostgreSQL](https://www.postgresql.org/) - The database management system used to store financial data.
- [Sequelize](https://sequelize.org/) - The ORM used to interact with the PostgreSQL database.

## Contact

If you have any questions or feedback, feel free to reach out to the project maintainer:

- **Name:** Prince
- **Email:** [pr28102003@gmail.com](mailto:pr28102003@gmail.com)

## Screenshots
![Landing Page Screenshot](https://github.com/prince-2003/FinTrack/blob/main/Screenshots/Landing.jpeg)
![Login Page Screenshot](https://github.com/prince-2003/FinTrack/blob/main/Screenshots/login.jpeg)
![Dashboard Screenshot](https://github.com/prince-2003/FinTrack/blob/main/Screenshots/Dashboard.jpeg)
![Settings Screenshot](https://github.com/prince-2003/FinTrack/blob/main/Screenshots/Setting.jpeg)

## Future Plans

- **Budgeting:** Add budgeting features to help users plan their finances.
- **Integration:** Integrate with third-party financial APIs for automatic transaction tracking.

