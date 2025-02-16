import React from 'react';
// import { useState } from 'react';
// import { Dialog, DialogPanel } from '@headlessui/react';
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from "react-oidc-context";
import { TransactionChart } from './TransactionChart';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import './App.css';

// const navigation = [


//   { name: 'Product', href: '#' },
//   { name: 'Features', href: '#' },
//   { name: 'Marketplace', href: '#' },
//   { name: 'Company', href: '#' },
// ]


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
    title: '',
    type: 'purchase'
  });
  const [entries, setEntries] = React.useState([]);
  const [showAlert, setShowAlert] = React.useState(false);

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
        title: formData.title,
        type: formData.type || 'purchase'
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
        setFormData({ date: '', cost: '', title: '', type: 'purchase' });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error saving to DynamoDB:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to save entry: ${error.message}`);
      }
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
      const command = new DeleteCommand({
        TableName: import.meta.env.VITE_DYNAMODB_TABLE,
        Key: {
          UserID: auth.user?.profile.email,
          TransactionID: transactionId
        }
      });
      
      await dynamoDb.send(command);
      await fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert(`Failed to delete entry: ${error.message}`);
    }
  };

  const signOutRedirect = () => {
    const clientId = "5gh0dubj45gj1oo07ptsiu05ks";
    const logoutUri = window.location.origin;
    const cognitoDomain = "https://card-stak.auth.us-east-1.amazonaws.com";
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
        {showAlert && <div className="custom-alert">Entry saved successfully!</div>}
        {/* <h2>Welcome, {auth.user?.profile.email}</h2> */}
        <h2 className='page-title'>Welcome to Card Stak</h2>
        <div className="top-nav">
          <button className="logout-btn" onClick={() => auth.removeUser()}>Sign out</button>
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <h3 className='input-form'>Input Card Transaction</h3>
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
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
          </select>
          <button type="submit">Submit</button>
        </form>

        <div className="chart-container">
          <TransactionChart entries={entries} />
        </div>
        {/* <div className="top-nav">
          <button className="logout-btn" onClick={() => auth.removeUser()}>Sign out</button>
        </div> */}
        
        <div className="entries-list">
          <h3>Card Transactions</h3>
          {entries.map(entry => (
            <div key={entry.TransactionID} className="entry-item">
              <span>{entry.date}</span>
              <span style={{ color: entry.cost < 0 ? 'red' : 'green' }}>${entry.cost}</span>
              <span>{entry.title}</span>
              <span className={`type-badge ${entry.type}`}>{entry.type}</span>
              <button onClick={() => handleDelete(entry.TransactionID)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (

        <div className="App">
          <header className="header">
            <div className="container">
              <h1 className='landing-title'>Card Stak</h1>
              <nav>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#get-started">Get Started</a></li>
                </ul>
              </nav>
            </div>
          </header>

          <section className="hero">
            <div className="container">
              <h2>Track Your Profits, Visualize Your Collection's Financial Growth</h2>
              <p>Card Stak helps you manage your trading card collection, track transactions, and visualize the value of your cards as they grow!</p>
              {/* <a href="#get-started" className="cta-btn">Get Started</a> */}
              <button  className="cta-btn" onClick={() => auth.signinRedirect()}>Get Started</button>
            </div>
          </section>

          <section id="features" className="features">
            <div className="container">
              <h2>Features</h2>
              <div className="feature">
                <h3>Transaction Tracking</h3>
                <p>Keep a detailed history of your trading card transactions.</p>
              </div>
              <div className="feature">
                <h3>Collection Visualization</h3>
                <p>View the growth and value of your collection over time with beautiful charts.</p>
              </div>
              <div className="feature">
                <h3>Valuation Insights</h3>
                <p>Get real-time insights into the market value of your trading cards.</p>
                <p className='coming-soon'>Coming Soon!</p>
              </div>
            </div>
          </section>

          <section id="pricing" className="pricing">
            <div className="container">
              <h2>Pricing</h2>
              <div className="pricing-tier">
                <h3>Free Plan</h3>
                <p>Basic features to help you track your growing collection.</p>
                <p>$0 / month</p>
              </div>
              <div className="pricing-tier">
                <h3>Pro Plan</h3>
                <p>Advanced features including valuation insights and data export.</p>
                {/* <p>$9.99 / month</p> */}
                <p className='coming-soon'>Coming Soon!</p>
              </div>
            </div>
          </section>

          <section id="get-started" className="get-started">
            <div className="container">
              <h2>Ready to Start Tracking Your Cards?</h2>
              <button className="cta-btn" onClick={() => auth.signinRedirect()}>Sign Up Now</button>
            </div>
          </section>

          <footer className="footer">
            <div className="container">
              <p>&copy; 2025 Card Stak. All rights reserved.</p>
            </div>
          </footer>
        </div>
    // <div className='login-page'>
    //   <h1 className='login-title'>Card Stak</h1>
    //   <div className='login-buttons'>
    //     <button className='login-button' onClick={() => auth.signinRedirect()}>Sign in</button>
    //     <button className='login-button' onClick={() => signOutRedirect()}>Sign out</button>
    //   </div>
    // </div>
  );
}

export default App;