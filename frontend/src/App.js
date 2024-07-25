import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import { formatDistanceToNow, parseISO } from "date-fns";
import "./App.css";

function App() {
  const [testCases, setTestCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const response = await axios.get("http://localhost:5000/testcases");
      setTestCases(response.data);
    } catch (error) {
      console.error("Error fetching test cases:", error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/testcases/${id}`, { status });
      fetchTestCases(); // Refresh test cases after update
    } catch (error) {
      console.error("Error updating test case status:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTestCases = testCases.filter((testCase) =>
    testCase.test_case_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get background color based on status
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'green';
      case 'FAIL':
        return 'red';
      default:
        return 'transparent'; 
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="icon">
            <FontAwesomeIcon icon={faSearch} />
          </div>
        </div>
      </header>
      <div className="container">
        <div className="filter">
          Filter <FontAwesomeIcon icon={faFilter} />
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Test Case Name</th>
                <th>Estimate Time <br /><span style={{fontSize: "10px"}}> ( In Minutes )</span></th>
                <th>Module</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestCases.map((testCase) => (
                <tr key={testCase.id}>
                  <td>
                    <span className="test-case-id">
                      Test Case ID: {testCase.id}
                    </span>
                    <div className="test-case">
                      {testCase.test_case_name}
                      <p style={{fontWeight: "bold"}}>
                        Last updated{" "}
                        {formatDistanceToNow(parseISO(testCase.last_updated), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </td>
                  <td>{testCase.estimate_time}</td>
                  <td>{testCase.module}</td>
                  <td>{testCase.priority}</td>
                  <td>
                    <select
                      value={testCase.status || ""}
                      onChange={(e) =>
                        handleStatusChange(testCase.id, e.target.value)
                      }
                      style={{ backgroundColor: getStatusBackgroundColor(testCase.status) }}
                    >
                      {!testCase.status && 
                      <option value="" disabled>
                        Select
                      </option>
                      } 
                      <option value="PASS">PASS</option>
                      <option value="FAIL">FAIL</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
