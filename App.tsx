import React, { useState, useEffect, useCallback } from 'react';
import { fetchFinancialData } from './services/geminiService';
import type { FinancialData, GroundingSource } from './types';
import InputControl from './components/InputControl';
import ResultCard from './components/ResultCard';
import SourceList from './components/SourceList';

const App: React.FC = () => {
  const [companyInput, setCompanyInput] = useState<string>('NVIDIA');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  
  const [editedPrice, setEditedPrice] = useState<string>('');
  const [editedFcf, setEditedFcf] = useState<string>('');
  const [editedWacc, setEditedWacc] = useState<string>('');

  const [implicitGrowth, setImplicitGrowth] = useState<number | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateGrowth = useCallback(() => {
    const price = parseFloat(editedPrice);
    const fcf = parseFloat(editedFcf);
    const wacc = parseFloat(editedWacc) / 100; // Convert percentage string to decimal

    if (!isNaN(price) && !isNaN(fcf) && !isNaN(wacc) && price > 0) {
      const growth = (wacc - (fcf / price)) * 100;
      setImplicitGrowth(growth);
    } else {
      setImplicitGrowth(null);
    }
  }, [editedPrice, editedFcf, editedWacc]);

  useEffect(() => {
    if (financialData) {
      calculateGrowth();
    }
  }, [financialData, calculateGrowth]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyInput.trim()) {
      setError('Please enter a company name or ticker.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setFinancialData(null);
    setSources([]);

    try {
      const { financialData: data, sources: fetchedSources } = await fetchFinancialData(companyInput);
      
      if (data.price === null || data.fcfPerShare === null || data.wacc === null) {
          setError(`Could not retrieve all necessary data for ${data.ticker || companyInput}. One or more values (Price, FCF, WACC) are missing.`);
          setIsLoading(false);
          return;
      }

      setFinancialData(data);
      setEditedPrice(data.price.toString());
      setEditedFcf(data.fcfPerShare.toString());
      setEditedWacc((data.wacc * 100).toString());
      setSources(fetchedSources);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
      <main className="max-w-4xl w-full mx-auto flex-grow">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">Implicit Growth Calculator</h1>
          <p className="text-gray-400 mt-2 text-lg">
            Uncover a stock's implied growth rate using the FCF perpetuity model.
          </p>
        </header>

        <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={companyInput}
                onChange={(e) => setCompanyInput(e.target.value)}
                placeholder="Enter company name or ticker (e.g., Apple or AAPL)"
                className="flex-grow bg-gray-700/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:text-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {financialData && (
           <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm space-y-6">
               <h2 className="text-2xl font-bold text-center text-white">
                 Financial Variables for {financialData.ticker || companyInput}
               </h2>
               <InputControl
                 label="Stock Price"
                 value={editedPrice}
                 onChange={(e) => setEditedPrice(e.target.value)}
                 symbol={financialData.currency || '$'}
                 type="currency"
               />
               <InputControl
                 label="FCF Per Share (TTM)"
                 value={editedFcf}
                 onChange={(e) => setEditedFcf(e.target.value)}
                 symbol={financialData.currency || '$'}
                 type="currency"
               />
               <InputControl
                 label="WACC (Weighted Average Cost of Capital)"
                 value={editedWacc}
                 onChange={(e) => setEditedWacc(e.target.value)}
                 type="percentage"
               />
             </div>
             <div className="space-y-8">
               <ResultCard growth={implicitGrowth} />
               {sources.length > 0 && <SourceList sources={sources} />}
             </div>
           </div>
        )}
      </main>

      <footer className="text-center text-gray-500 text-xs mt-12 py-4">
        <p>Disclaimer: This application is for informational and educational purposes only. The data and calculations provided should not be considered investment advice. Always conduct your own research before making any financial decisions.</p>
      </footer>
    </div>
  );
};

export default App;