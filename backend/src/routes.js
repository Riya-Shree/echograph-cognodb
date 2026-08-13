const express = require('express');
const driver = require('./db');

const router = express.Router();

/**
 * GET /api/users
 * Returns all users in the graph.
 */
router.get('/users', async (req, res, next) => {
    const session = driver.session();

    try {
        const result = await session.run(
            `
            MATCH (u:User)
            RETURN
                u.userId AS id,
                u.name AS name
            ORDER BY u.userId
            `
        );

        const users = result.records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
        }));

        res.json(users);
    } catch (error) {
        console.error('❌ Users query error:', error);
        next(error);
    } finally {
        await session.close();
    }
});


/**
 * GET /api/users/:userId/recommendations
 *
 * Recommendation logic:
 * 1. Find people followed by the requested user.
 * 2. Find tracks those people listen to.
 * 3. Find the artist of each track.
 * 4. Build a list of tracks already listened to by the requested user.
 * 5. Remove those already-listened tracks.
 * 6. Count how many followed users listened to each remaining track.
 * 7. Return recommendations ordered by recommendation count.
 */
router.get('/users/:userId/recommendations', async (req, res, next) => {
    const session = driver.session();
    const { userId } = req.params;

    try {
        const query = `
            MATCH (u:User {userId: $userId})-[:FOLLOWS]->(friend:User)

            MATCH (friend)-[:LISTENS_TO]->(t:Track)

            MATCH (t)-[:BY]->(a:Artist)

            WITH
                u,
                t,
                a,
                count(DISTINCT friend) AS recommendedBy

            WITH
                u,
                t,
                a,
                recommendedBy,
                [(u)-[:LISTENS_TO]->(myTrack:Track) | myTrack.trackId] AS myTracks

            WHERE NOT t.trackId IN myTracks

            RETURN
                t.trackId AS trackId,
                t.title AS track,
                a.name AS artist,
                recommendedBy

            ORDER BY recommendedBy DESC
        `;

        const result = await session.run(query, { userId });

        const recommendations = result.records.map(record => ({
            trackId: record.get('trackId'),
            track: record.get('track'),
            artist: record.get('artist'),
            recommendedBy: record.get('recommendedBy').toNumber()
        }));

        console.log(
            `✅ Found ${recommendations.length} recommendations for ${userId}`
        );

        res.json(recommendations);

    } catch (error) {
        console.error('❌ Recommendation query error:', error);
        next(error);

    } finally {
        await session.close();
    }
});


module.exports = router;