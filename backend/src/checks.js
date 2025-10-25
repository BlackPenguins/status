import { execSync } from 'child_process';
import fs from "fs";
import path from "path";


const DOCKER_CONTAINER_NAMES = [
    'ideaprojects-mangia-backend-1',
    'mrroboto'
];

const WEBSITE_URLS = [
    'http://mangia.penguinore.net',
    'http://yap.penguinore.net',
    'http://silly.penguinore.net'
];

const PATHS = [
    {
        name: "Authentication",
        path: "/home/mmiles/IdeaProjects/authentication/"
    },
    { 
        name: "Pictures",
        path: "/home/mmiles/Pictures/NEW.txt"
    },
    {
        name: "DatabaseSQL",
        path: "/home/mmiles/Downloads/all-databases.sql"
    },
    {
        name: "Love",
        path: "/home/love"
    }
];

const getDiskUsage = () => {
    try {
        const output = execSync("df -h / | tail -1").toString().trim();
        const parts = output.split(/\s+/);
        if (parts.length < 5) throw new Error("Unexpected df output format: " + output);

        const total = parts[1];
        const used = parts[2];
        const free = parts[3];
        const percent = parts[4];
        return { total, used, free, percent };
    } catch (err) {
        console.log("Disk Check Failure", err)
        return null;
    }
}

const getDockerStatus = () => {
    try {
        const output = execSync("docker ps --format '{{.Names}} {{.Status}}'").toString();

        const running = output
            .split("\n")
            .filter(Boolean)
            .reduce((map, line) => {
                const [name, ...status] = line.split(" ");
                map[name] = status.join(" ");
                return map;
            }, {}
        );

        const results = DOCKER_CONTAINER_NAMES.map((name) => ({
            name,
            status: !!running[name] ? "up" : "down",
            details: running[name] || "stopped",
        }));


        return results;
    } catch (err) {
        console.log("Docker check failure", err)
        return null;
    }
}

const checkWebsites = async () => {
    const results = await Promise.all(WEBSITE_URLS.map(async (url) => {
        const name = url;
        let status;
        let details;
        try {
            const response = await fetch(url, { method: "HEAD", timeout: 5000 });
            status = response.ok ? "up" : "down";
            details = response.status;
        } catch (err) {
            status = 'down';
            details = 'unreachable';
        }

        return {
            name,
            status,
            details
        };
    }));

    return results;
}

const checkBackups = async () => {
    const results = PATHS.map((obj) => {
    const p = obj.path;
    const name = obj.name;
    try {
        let status;
        let details;
        
        if (!fs.existsSync(p)) {
            status = 'down';
            details = 'missing'
        } else {
            let latestMtime = 0;

            const stats = fs.statSync(p);

            if (stats.isDirectory()) {
                const files = fs.readdirSync(p);
                files.forEach((file) => {
                    const fstats = fs.statSync(path.join(p, file));
                    if (fstats.mtimeMs > latestMtime) {
                        latestMtime = fstats.mtimeMs;
                    }
                });
            } else if (stats.isFile()) {
                latestMtime = stats.mtimeMs;
            } else {
                status = "unknown type";
            }

            const lastUpdated = new Date(latestMtime);
            const now = new Date();
            const diffHours = (now - lastUpdated) / 1000 / 60 / 60;
            const recent = diffHours <= 24;
            const hoursAgoLabel = `(${diffHours.toFixed(0)} hours ago)`;
            status = recent ? 'up' : 'warn';
            details = recent ? `ok ${hoursAgoLabel}` : `stale ${hoursAgoLabel}`;
        }

        return {
            name,
            status,
            details
        };
    } catch (err) {
        console.log("Backup Check Error", err);
        return null;
    }
    });
    
    return results;
}

const getSystemStatus = async () => {
    const dateOutput = execSync("date").toString().trim();

    return {
        disk: await getDiskUsage(),
        docker: await getDockerStatus(),
        websites: await checkWebsites(),
        backups: await checkBackups(),
        // Add backup check or last modified date as needed
        date: dateOutput
    };
}

export default getSystemStatus;
