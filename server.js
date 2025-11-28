import express from "express";
import methodOverride from "method-override";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://localhost:4000"; 

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));


app.get("/", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/api/links`);
        res.render("index.ejs", {BASE_URL: `http://localhost:${port}`, links: response.data});
    } catch (error) {
        console.error("Error fetching links for dashboard:", error.message);
        res.render("index.ejs", {BASE_URL: `http://localhost:${port}`, links: [], error: "Failed to load links."});
    }
});

app.get("/add", (req, res) => {
    res.render("modify.ejs");
});

app.get("/:code", async (req, res) => {
    const { code } = req.params;
    try {
        const response = await axios.get(`${API_URL}/links/${code}/redirect`);
        const targetUrl = response.data.targetUrl;

        return res.redirect(302, targetUrl);

    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).send("TinyLink not found.");
        }
        console.error("Error during public redirect:", err.message);
        return res.status(500).send("Server error during redirection.");
    }
});

app.get("/code/:code", async (req, res) => {
    const { code } = req.params;

    try {
        const response = await axios.get(`${API_URL}/api/links/${code}`);
        
        res.render("stats.ejs", { link: response.data, BASE_URL: `http://localhost:${port}` });

    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).send(`Stats for short code "${code}" not found.`);
        }
        console.error("Error fetching stats:", err.message);
        res.status(500).send("Failed to retrieve link statistics.");
    }
});

app.get("/healthz", async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/healthz`);
        
        res.status(response.status).json(response.data);

    } catch (err) {
        console.error("API Server health check failed:", err.message);
        res.status(503).json({ 
            ok: false, 
            version: "1.0",
            message: "API Server is unreachable."
        });
    }
});

app.get("/search", async (req, res) => {
    const searchTerm = req.query.search; 

    try {
        const response = await axios.get(`${API_URL}/api/links`, {
            params: {
                query: searchTerm 
            }
        });
        
        res.render("index.ejs", {
            BASE_URL: `http://localhost:${port}`, 
            links: response.data,
            searchTerm: searchTerm 
        });

    } catch (error) {
        console.error("Error during search:", error.message);
        res.render("index.ejs", { 
            BASE_URL: `http://localhost:${port}`, 
            links: [], 
            searchTerm: searchTerm,
            error: "Failed to perform search." 
        });
    }
});

app.post("/api/links", async (req, res) => {
    try {
        await axios.post(`${API_URL}/links`, req.body);
        res.redirect("/");
    } catch (err) {
        console.error("Error creating short URL:", err.message);
        res.status(500).render("modify.ejs", { error: "Error creating shortenURL or code already exists." });
    }
});

app.delete("/api/links/:code", async(req, res) => {
    const { code } = req.params; 
    try{
        await axios.delete(`${API_URL}/api/links/${code}`);
        
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting link:", err.message);
        res.redirect("/?error=DeletionFailed");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});