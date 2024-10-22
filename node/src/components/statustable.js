import React, { useEffect, useState } from 'react';
import './statustable.css';

const Status = () => {
    const [nodes, setNodes] = useState([]);

    // Fetch data from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/nodes/?skip=0&limit=1000');
                const data = await response.json();
                setNodes(data);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        // Initial fetch
        fetchData();

        // Set interval for auto-refresh (e.g., every 5 seconds)
        const intervalId = setInterval(fetchData, 5000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // Helper function to check if services contain 'start'
    const hasStartService = (services) => {
        return services.toLowerCase().includes('start');
    };

    // Sort nodes: Start services come first
    const sortedNodes = nodes.sort((a, b) => {
        const aHasStart = hasStartService(a.services);
        const bHasStart = hasStartService(b.services);
        return aHasStart === bHasStart ? 0 : aHasStart ? -1 : 1;
    });

    return (
        <div>
            <h2>Nodes Data</h2>
            <table>
                <thead>
                    <tr>
                        <th>Node ID</th>
                        <th>Services</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedNodes.map((node, index) => (
                        <tr key={index}>
                            <td>{node.node_id}</td>
                            <td>
                                {/* Display a green or red circle before the service name with matching shadow */}
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: hasStartService(node.services) ? 'green' : 'red',
                                        marginRight: '10px',
                                        boxShadow: hasStartService(node.services)
                                            ? '0 0 10px rgba(0, 128, 0, 0.7)'  // Green shadow for green circle
                                            : '0 0 10px rgba(255, 0, 0, 0.7)',   // Red shadow for red circle
                                    }}
                                ></span>
                                {node.services}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Status;
