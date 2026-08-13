const neo4j = require('neo4j-driver');
require('dotenv').config();

// Initialize the Neo4j Driver using credentials from the .env file
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

// Graceful error handling function as required by the assignment
const verifyConnectivity = async () => {
    try {
        const serverInfo = await driver.getServerInfo();
        console.log(`✅ Successfully connected to CognoDB! Server Info: ${serverInfo.address}`);
    } catch (error) {
        console.error('❌ Failed to connect to CognoDB. Please check your credentials and network.');
        console.error(`Error details: ${error.message}`);
        // We do not crash the app entirely, demonstrating graceful error handling
    }
};

// Call the function to test connection on startup
verifyConnectivity();

module.exports = driver;