// App.js
import React from 'react';
import { useAuth } from "react-oidc-context";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

function App() {
  const auth = useAuth();
  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: fromCognitoIdentityPool({
      identityPoolId: "us-east-1:fe419dca-de50-4bdb-9887-50a93e412a64",
      clientConfig: { region: "us-east-1" },
      logins: {
        'cognito-idp.us-east-1.amazonaws.com/us-east-1_nuni86pdc': auth.user?.id_token
      }
    })
  });
  const dynamoDb = DynamoDBDocumentClient.from(client);
  
  const [formData, setFormData] = React.useState({
    date: '',
    cost: '',
    title: ''
  });
  const [entries, setEntries] = React.useState([]);

  const fetchEntries = async () => {
    if (!auth.user?.profile.email) return;
    
    try {
      const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
      const command = new QueryCommand({
        TableName: import.meta.env.VITE_DYNAMODB_TABLE,
        KeyConditionExpression: "UserID = :userId",
        ExpressionAttributeValues: {
          ":userId": auth.user.profile.email
        }
      });
      
      const result = await dynamoDb.send(command);
      setEntries(result.Items || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  React.useEffect(() => {
    if (auth.isAuthenticated) {
      fetchEntries();
    }
  }, [auth.isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.date && formData.cost && formData.title) {
      const transactionId = Date.now().toString();
      const userId = auth.user?.profile.email;

      const entry = {
        UserID: userId,
        TransactionID: transactionId,
        date: formData.date,
        cost: parseFloat(formData.cost),
        title: formData.title
      };

      try {
        console.log('Saving to DynamoDB:', entry);
        console.log('Table name:', import.meta.env.VITE_DYNAMODB_TABLE);
        
        const command = new PutCommand({
          TableName: import.meta.env.VITE_DYNAMODB_TABLE,
          Item: entry
        });
        
        const result = await dynamoDb.send(command);
        console.log('DynamoDB response:', result);

        await fetchEntries();
        setFormData({ date: '', cost: '', title: '' });
        alert('Entry saved successfully!');
      } catch (error) {
        console.error('Error saving to DynamoDB:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to save entry: ${error.message}`);
      }
    }
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const signOutRedirect = () => {
    const clientId = "5gh0dubj45gj1oo07ptsiu05ks";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://us-east-1nuni86pdc.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="dashboard">
        <h2>Welcome, {auth.user?.profile.email}</h2>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleInputChange}
            placeholder="USD$"
            required
          />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title of transaction"
            required
          />
          <button type="submit">Submit</button>
        </form>

        <div className="entries-list">
          {entries.map(entry => (
            <div key={entry.TransactionID} className="entry-item">
              <span>{entry.date}</span>
              <span>${entry.cost}</span>
              <span>{entry.title}</span>
              <button onClick={() => handleDelete(entry.TransactionID)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default App;