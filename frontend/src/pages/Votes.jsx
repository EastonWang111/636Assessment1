import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const Votes = () => {
    const { user: authUser } = useAuth();
    const [votes, setVotes] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newVote, setNewVote] = useState({
        title: '',
        description: '',
        options: ['', '']
    });

    const fetchVotes = useCallback(async () => {
        if (!authUser?.token) {
            setLoading(false);
            return;
        }
        try {
            const response = await axiosInstance.get('/votes', {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setVotes(response.data);
        } catch (error) {
            setError('Failed to fetch vote list');
        } finally {
            setLoading(false);
        }
    }, [authUser]);

    const fetchUserProfile = useCallback(async () => {
        if (!authUser?.token) {
            return;
        }
        try {
            const response = await axiosInstance.get('/auth/profile', {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            setError('Failed to fetch user info');
        }
    }, [authUser]);

    useEffect(() => {
        fetchVotes();
        fetchUserProfile();
    }, [fetchVotes, fetchUserProfile]); 

    const handleCreateVote = async (e) => {
        e.preventDefault();
        try {
            const filteredOptions = newVote.options.filter(option => option.trim() !== '');
            
            if (filteredOptions.length < 2) {
                setError('At least two options are required');
                return;
            }

            await axiosInstance.post('/votes', {
                ...newVote,
                options: filteredOptions
            }, {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });

            setNewVote({ title: '', description: '', options: ['', ''] });
            setShowCreateForm(false);
            fetchVotes();
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create vote');
        }
    };

    const handleVote = async (voteId, optionIndex) => {
        try {
            await axiosInstance.post(`/votes/${voteId}/cast`, {
                optionIndex
            }, {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            fetchVotes();
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to vote');
        }
    };

    const handleCloseVote = async (voteId) => {
        try {
            await axiosInstance.patch(`/votes/${voteId}/close`, {}, {
                headers: { Authorization: `Bearer ${authUser.token}` }
            });
            fetchVotes();
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to close vote');
        }
    };

    const handleDeleteVote = async (voteId) => {
        if (window.confirm('Are you sure you want to delete this vote? This action cannot be undone and will permanently delete the vote and all its data.')) {
            try {
                setLoading(true);
                await axiosInstance.delete(`/votes/${voteId}`, {
                    headers: { Authorization: `Bearer ${authUser.token}` }
                });
                
                // Display success message
                alert('Vote deleted successfully!');
                
                // Re-obtain the voting list
                await fetchVotes();
                setError('');
            } catch (error) {
                console.error('Failed to delete vote:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete vote, please try again later';
                setError(errorMessage);
                alert(`Delete failed: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        }
    };

    const addOption = () => {
        setNewVote({
            ...newVote,
            options: [...newVote.options, '']
        });
    };

    const removeOption = (index) => {
        if (newVote.options.length > 2) {
            const newOptions = newVote.options.filter((_, i) => i !== index);
            setNewVote({ ...newVote, options: newOptions });
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...newVote.options];
        newOptions[index] = value;
        setNewVote({ ...newVote, options: newOptions });
    };

    // If user is not logged in, show login prompt
    if (!authUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login first</h2>
                    <p className="text-gray-600">You need to login to view and participate in voting</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Voting System</h1>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {showCreateForm ? 'Cancel' : 'Create New Vote'}
                    </button>
                )}
                {user?.role !== 'admin' && (
                    <div className="text-sm text-gray-600">
                        Current User: {user?.name} (Regular User)
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Create vote form */}
            {showCreateForm && user?.role === 'admin' && (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
                    <h2 className="text-xl font-bold mb-4">Create New Vote</h2>
                    <form onSubmit={handleCreateVote}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Vote Title
                            </label>
                            <input
                                type="text"
                                value={newVote.title}
                                onChange={(e) => setNewVote({ ...newVote, title: e.target.value })}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Vote Description
                            </label>
                            <textarea
                                value={newVote.description}
                                onChange={(e) => setNewVote({ ...newVote, description: e.target.value })}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                rows="3"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Vote Options
                            </label>
                            {newVote.options.map((option, index) => (
                                <div key={index} className="flex mb-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder={`Option ${index + 1}`}
                                        required
                                    />
                                    {newVote.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addOption}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
                            >
                                Add Option
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Create Vote
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Vote list */}
            <div className="grid gap-6">
                {votes.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No votes available
                    </div>
                ) : (
                    votes.map((vote) => {
                        const totalVotes = vote.options.reduce((sum, option) => sum + option.votes, 0);
                        const hasVoted = vote.voters.includes(user?._id);
                        
                        return (
                            <div key={vote._id} className="bg-white shadow-md rounded-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{vote.title}</h3>
                                        {vote.description && (
                                            <p className="text-gray-600 mt-2">{vote.description}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Creator: {vote.createdBy?.name ?? 'Unknown user'} | 
                                            Status: <span className={vote.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                                                {vote.status === 'active' ? 'Active' : 'Closed'}
                                            </span> | 
                                            Total Votes: {totalVotes}
                                        </p>
                                    </div>
                                    {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                            {vote.status === 'active' && (
                                <button
                                    onClick={() => handleCloseVote(vote._id)}
                                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                                    title="Users will not be able to continue voting after closing the vote"
                                >
                                    Close Vote
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteVote(vote._id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors"
                                title="Deleting the vote will permanently remove all data"
                            >
                                Delete Vote
                            </button>
                        </div>
                    )}
                                </div>
                                
                                <div className="space-y-3">
                                    {vote.options.map((option, index) => {
                                        const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                                        
                                        return (
                                            <div key={index} className="border rounded p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{option.text}</span>
                                                    <span className="text-sm text-gray-600">
                                                        {option.votes} votes ({percentage}%)
                                                    </span>
                                                </div>
                                                
                                                {/* Progress bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                
                                                {/* Vote button */}
                                                {vote.status === 'active' && !hasVoted && (
                                                    <button
                                                        onClick={() => handleVote(vote._id, index)}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                                                    >
                                                        Vote
                                                    </button>
                                                )}
                                                
                                                {hasVoted && (
                                                    <span className="text-green-600 text-sm font-medium">
                                                        Voted
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Votes;