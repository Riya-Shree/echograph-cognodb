require('dotenv').config();
const driver = require('../src/db');

const seedDatabase = async () => {
    const session = driver.session();
    
    // We break everything into tiny, atomic, single-action queries.
    // This is 100% foolproof in every graph database version.
    const queries = [
        "MATCH (n) DETACH DELETE n", // Wipe db
        
        // 1. Create Nodes
        "CREATE (:User {userId: 'u1', name: 'Alice'})",
        "CREATE (:User {userId: 'u2', name: 'Bob'})",
        "CREATE (:User {userId: 'u3', name: 'Charlie'})",
        "CREATE (:User {userId: 'u4', name: 'Diana'})",
        
        "CREATE (:Artist {artistId: 'a1', name: 'The Midnight'})",
        "CREATE (:Artist {artistId: 'a2', name: 'Arctic Monkeys'})",
        "CREATE (:Artist {artistId: 'a3', name: 'Florence + The Machine'})",
        
        "CREATE (:Track {trackId: 't1', title: 'Sunset'})",
        "CREATE (:Track {trackId: 't2', title: 'Do I Wanna Know?'})",
        "CREATE (:Track {trackId: 't3', title: 'Dog Days Are Over'})",
        "CREATE (:Track {trackId: 't4', title: 'Vampires'})",

        // 2. Wire the Network Using Explicit Matches
        "MATCH (a:User {userId: 'u1'}), (b:User {userId: 'u2'}) CREATE (a)-[:FOLLOWS]->(b)",
        "MATCH (a:User {userId: 'u1'}), (b:User {userId: 'u3'}) CREATE (a)-[:FOLLOWS]->(b)",
        "MATCH (a:User {userId: 'u2'}), (b:User {userId: 'u4'}) CREATE (a)-[:FOLLOWS]->(b)",
        "MATCH (a:User {userId: 'u3'}), (b:User {userId: 'u2'}) CREATE (a)-[:FOLLOWS]->(b)",

        "MATCH (u:User {userId: 'u1'}), (t:Track {trackId: 't1'}) CREATE (u)-[:LISTENS_TO]->(t)",
        "MATCH (u:User {userId: 'u1'}), (t:Track {trackId: 't2'}) CREATE (u)-[:LISTENS_TO]->(t)",
        "MATCH (u:User {userId: 'u2'}), (t:Track {trackId: 't1'}) CREATE (u)-[:LISTENS_TO]->(t)",
        "MATCH (u:User {userId: 'u2'}), (t:Track {trackId: 't4'}) CREATE (u)-[:LISTENS_TO]->(t)",
        "MATCH (u:User {userId: 'u3'}), (t:Track {trackId: 't2'}) CREATE (u)-[:LISTENS_TO]->(t)",
        "MATCH (u:User {userId: 'u3'}), (t:Track {trackId: 't3'}) CREATE (u)-[:LISTENS_TO]->(t)",
        "MATCH (u:User {userId: 'u4'}), (t:Track {trackId: 't4'}) CREATE (u)-[:LISTENS_TO]->(t)",

        "MATCH (t:Track {trackId: 't1'}), (a:Artist {artistId: 'a1'}) CREATE (t)-[:BY]->(a)",
        "MATCH (t:Track {trackId: 't2'}), (a:Artist {artistId: 'a2'}) CREATE (t)-[:BY]->(a)",
        "MATCH (t:Track {trackId: 't3'}), (a:Artist {artistId: 'a3'}) CREATE (t)-[:BY]->(a)",
        "MATCH (t:Track {trackId: 't4'}), (a:Artist {artistId: 'a1'}) CREATE (t)-[:BY]->(a)"
    ];

    try {
        console.log('⏳ Running atomic seed queries...');
        for (let i = 0; i < queries.length; i++) {
            await session.run(queries[i]);
            console.log(`✅ Executed query ${i + 1}/${queries.length}`);
        }
        console.log('🎉 Database perfectly seeded and explicitly wired!');
    } catch (error) {
        console.error('❌ Error executing query:', error);
    } finally {
        await session.close();
        await driver.close();
        process.exit(0);
    }
};

seedDatabase();