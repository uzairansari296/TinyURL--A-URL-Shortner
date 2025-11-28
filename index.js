import express from "express";
import methodOverride from "method-override";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = process.env.PORT || 4000;
env.config();

// Validate environment variables
const requiredEnvVars = ['PG_USER', 'PG_HOST', 'PG_DATABASE', 'PG_PASSWORD', 'PG_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please set these in your Render dashboard Environment section.');
    process.exit(1);
}

console.log('✅ Database config:', {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    // Don't log password for security
});

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

// Connect with error handling
try {
    await db.connect();
    console.log('✅ Connected to database successfully');
} catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
}

// Frontend middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');

// API middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const generateShortCode = (length = 7) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Frontend Routes
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT short_code, target_url, total_clicks, last_clicked_at, created_at FROM links ORDER BY created_at DESC");
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `http://localhost:${port}`;
        res.render("index.ejs", {BASE_URL: baseUrl, links: result.rows});
    } catch (error) {
        console.error("Error fetching links for dashboard:", error.message);
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `http://localhost:${port}`;
        res.render("index.ejs", {BASE_URL: baseUrl, links: [], error: "Failed to load links."});
    }
});

app.get("/add", (req, res) => {
    res.render("modify.ejs");
});

app.get("/search", async (req, res) => {
    const searchTerm = req.query.search;
    try {
        let queryText = "SELECT short_code, target_url, total_clicks, last_clicked_at, created_at FROM links";
        let queryParams = [];
        
        if (searchTerm) {
            queryText += " WHERE short_code ILIKE $1";
            queryParams.push(`%${searchTerm}%`);
        }
        
        queryText += " ORDER BY created_at DESC";
        const result = await db.query(queryText, queryParams);
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `http://localhost:${port}`;
        
        res.render("index.ejs", {
            BASE_URL: baseUrl,
            links: result.rows,
            searchTerm: searchTerm
        });
    } catch (error) {
        console.error("Error during search:", error.message);
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `http://localhost:${port}`;
        res.render("index.ejs", {
            BASE_URL: baseUrl,
            links: [],
            searchTerm: searchTerm,
            error: "Failed to perform search."
        });
    }
});

app.get("/code/:code", async (req, res) => {
    const { code } = req.params;
    try {
        const queryText = `
            SELECT short_code, target_url, total_clicks, last_clicked_at, created_at
            FROM links
            WHERE short_code = $1;
        `;
        const result = await db.query(queryText, [code]);
        
        if (result.rowCount === 0) {
            return res.status(404).send(`Stats for short code "${code}" not found.`);
        }
        
        const baseUrl = process.env.NODE_ENV === 'production' ? `https://${req.get('host')}` : `http://localhost:${port}`;
        res.render("stats.ejs", { link: result.rows[0], BASE_URL: baseUrl });
    } catch (err) {
        console.error("Error fetching stats:", err.message);
        res.status(500).send("Failed to retrieve link statistics.");
    }
});

// Public redirect route (must be before API routes to avoid conflicts)
app.get("/:code", async (req, res) => {
    const { code } = req.params;
    
    // Skip if it's an API route or static file
    if (code.startsWith('api') || code.includes('.')) {
        return res.status(404).send("Not found");
    }
    
    try {
        const queryText = `
            UPDATE links
            SET total_clicks = total_clicks + 1,
                last_clicked_at = NOW()
            WHERE short_code = $1
            RETURNING target_url;
        `;
        const result = await db.query(queryText, [code]);

        if (result.rowCount === 0) {
            return res.status(404).send("TinyLink not found.");
        }

        return res.redirect(302, result.rows[0].target_url);
    } catch (err) {
        console.error("Error during public redirect:", err.message);
        return res.status(500).send("Server error during redirection.");
    }
});

// API Routes
app.get("/api/links", async(req, res) => {
    const searchTerm = req.query.query; 

    let queryText = "SELECT short_code, target_url, total_clicks, last_clicked_at, created_at FROM links";
    let queryParams = [];

    if (searchTerm) {
        queryText += " WHERE short_code ILIKE $1";
        queryParams.push(`%${searchTerm}%`); 
    }
    
    queryText += " ORDER BY created_at DESC";

    try {
        const result = await db.query(queryText, queryParams);
        res.send(result.rows);
    } catch (err) {
        console.error("Database error while fetching links:", err);
        res.status(500).json({ error: "Failed to retrieve links." });
    }
});

// Frontend form handling
app.post("/api/links", async (req, res) => {
    try {
        const { longURL: targetUrl, code: customCode } = req.body;
        let code = customCode;

        if (!code) {
            code = generateShortCode(); 
        }
        
        if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
            return res.status(500).render("modify.ejs", { error: "Short code must be 6-8 alphanumeric characters." });
        }

        const queryText = `
            INSERT INTO links (short_code, target_url)
            VALUES ($1, $2)
            RETURNING short_code, target_url, total_clicks, created_at;
        `;
        await db.query(queryText, [code, targetUrl]);
        res.redirect("/");
    } catch (err) {
        console.error("Error creating short URL:", err.message);
        res.status(500).render("modify.ejs", { error: "Error creating shortenURL or code already exists." });
    }
});

app.delete("/api/links/:code", async(req, res) => {
    const { code } = req.params; 
    try{
        const queryText = `
            DELETE FROM links
            WHERE short_code = $1
            RETURNING short_code;
        `;
        const result = await db.query(queryText, [code]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Link with code '${code}' not found.` });
        }
        
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting link:", err.message);
        res.redirect("/?error=DeletionFailed");
    }
});

// API Routes for JSON responses
app.post("/links", async (req, res) => {
    const { longURL: targetUrl, code: customCode } = req.body;
    let code = customCode;

    if (!code) {
        code = generateShortCode(); 
    }
    
    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
        return res.status(400).json({ error: "Short code must be 6-8 alphanumeric characters." });
    }

    try {
        const queryText = `
            INSERT INTO links (short_code, target_url)
            VALUES ($1, $2)
            RETURNING short_code, target_url, total_clicks, created_at;
        `;
        const result = await db.query(queryText, [code, targetUrl]);
        
        return res.status(201).json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: `The custom code '${code}' is already in use.` });
        }
        console.error("Database error during link creation:", err);
        return res.status(500).json({ error: "An unexpected error occurred." });
    }
});

app.get("/api/links/:code", async (req, res) => {
    const { code } = req.params;

    try {
        const queryText = `
            SELECT short_code, target_url, total_clicks, last_clicked_at, created_at
            FROM links
            WHERE short_code = $1;
        `;
        const result = await db.query(queryText, [code]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Link with code '${code}' not found.` });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error("Database error while fetching link stats:", err);
        return res.status(500).json({ error: "Failed to retrieve link stats." });
    }
});

app.delete("/api/links/:code", async (req, res) => {
    const { code } = req.params; 

    try {
        const queryText = `
            DELETE FROM links
            WHERE short_code = $1
            RETURNING short_code;
        `;
        const result = await db.query(queryText, [code]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Link with code '${code}' not found.` });
        }

        return res.status(204).send();
    } catch (err) {
        console.error("Database error during link deletion:", err);
        return res.status(500).json({ error: "Failed to delete link." });
    }
});

app.get("/links/:code/redirect", async (req, res) => {
    const { code } = req.params;

    try {
        const queryText = `
            UPDATE links
            SET total_clicks = total_clicks + 1,
                last_clicked_at = NOW()
            WHERE short_code = $1
            RETURNING target_url;
        `;
        const result = await db.query(queryText, [code]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Short code not found." });
        }

        return res.json({ targetUrl: result.rows[0].target_url });

    } catch (err) {
        console.error("Database error during redirect update:", err);
        return res.status(500).json({ error: "Server error during link tracking." });
    }
});


app.get("/healthz", async (req, res) => {
    try {
        await db.query("SELECT 1"); 
        
        return res.status(200).json({ 
            ok: true, 
            version: "1.0",
            db_status: "connected"
        });
    } catch (err) {
        console.error("Health check failed:", err.message);
        return res.status(503).json({ 
            ok: false, 
            version: "1.0",
            db_status: "disconnected",
            error: "Database connection failed"
        });
    }
});

app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});