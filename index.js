#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const open = require('open');
const fs = require('fs');
const path = require('path');
const os = require('os');

const program = new Command();
const CONFIG_DIR = path.join(os.homedir(), '.insighta');
const CONFIG_FILE = path.join(CONFIG_DIR, 'credentials.json');
const BACKEND_URL = 'https://hng-stage-three-task.vercel.app/api/v1'; // Update to your Stage 3 URL

// Helper: Save Tokens
const saveCredentials = (tokens) => {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(tokens, null, 2));
    console.log('✅ Logged in successfully. Credentials saved to ~/.insighta/credentials.json');
};

// Helper: Get Tokens
const getCredentials = () => {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
};

program
    .name('insighta')
    .description('CLI to interact with Insighta Labs+ API')
    .version('1.0.0');

// COMMAND: LOGIN
program
    .command('login')
    .description('Login via GitHub OAuth')
    .action(async () => {
        console.log('🔗 Opening browser for GitHub Authentication...');
        // In a real PKCE flow, you'd generate the challenge here.
        // For simplicity in this task, we direct to the backend OAuth start point.
        await open(`${BACKEND_URL}/auth/github`);
        
        console.log('⏳ After authorizing in the browser, paste your access token here:');
        // The HNG Stage 3 requirements often allow a "Copy Token" page from the web portal 
        // OR a local listener. Here is the direct input method for reliability:
        process.stdin.resume();
        process.stdin.on('data', (data) => {
            const token = data.toString().trim();
            saveCredentials({ accessToken: token });
            process.exit();
        });
    });

// COMMAND: QUERY (The Stage 2 NLP Feature)
program
    .command('query <string>')
    .description('Run a natural language query')
    .action(async (queryString) => {
        const creds = getCredentials();
        if (!creds) return console.error('❌ Not logged in. Run: insighta login');

        try {
            const response = await axios.get(`${BACKEND_URL}/profiles/search`, {
                params: { q: queryString },
                headers: { Authorization: `Bearer ${creds.accessToken}` }
            });
            console.table(response.data.data);
        } catch (err) {
            console.error('❌ Query failed:', err.response?.data?.message || err.message);
        }
    });

program.parse(process.argv);