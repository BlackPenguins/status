import React, { useEffect, useState } from 'react';
import Card from './Card';

const Dashboard = () => {
    const [status, setStatus] = useState(null);

    const fetchStatus = async () => {
        const response = await fetch('http://localhost:9200/status');
        const data = await response.json();
        setStatus(data);
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    if (!status) return <p>Loading...</p>;

    return (
        <div className="dashboard">
            <Card title="Disk Usage">
                <Disk disk={status.disk}/>
            </Card>

            <Card title="Docker">
                <StatusBox name='Docker' things={status.docker}/>
            </Card>

            <Card title="Websites">
                <StatusBox name='Website' things={status.websites}/>
            </Card>

            <Card title="Backups">
                <StatusBox name='Backup' things={status.backups}/>
            </Card> 
        </div>
    );
}

const Disk = ( {disk}) => {
    if( !disk ) {
        return (
            <div style={{display: 'flex'}}>
                <Icon status='down'/>Disk check is offline!
            </div>
        )
    }

    return (
        <>
            <p>Total: {disk.total}</p>
            <p>Used: {disk.used}</p>
            <p>Free: {disk.free}</p>
            <div className="progress">
                <div
                    className="bar"
                    style={{ width: disk.percent, backgroundColor: "#4CAF50" }}
                ></div>
            </div>
            <p>{disk.percent} used</p>
        </>
    );
}

const StatusBox = ({name, things}) => {
    if( !things ) {
        return (
            <div style={{display: 'flex'}}>
                <Icon status='down'/>{name} check is offline!
            </div>
        )
    }

     return (
        <>
            {things.map(c => {
      
                return (
                    <div key={c.name} style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                        borderBottom: "1px solid #eee",
                        paddingBottom: 6
                    }}>
                       <Icon status={c.status}/>

                        <div style={{ flexGrow: 1 }}>
                            <strong>{c.name}</strong>
                            <div style={{ fontSize: 12, color: "#666" }}>{c.details}</div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

const Icon = ( {status} ) => {
    let icon, color;

    if (status == 'down') {
        icon = "✕";
        color = "#f44336"; // red
    } else if (status == 'up') {
        icon = "✓";
        color = "#4caf50"; // green
    } else {
        icon = "⚠";
        color = "#ff9800"; // orange/yellow
    }

    return (
        <div
            style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                backgroundColor: color,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                marginRight: 10,
            }}
        >
            {icon}
        </div>
    )
}

export default Dashboard;
