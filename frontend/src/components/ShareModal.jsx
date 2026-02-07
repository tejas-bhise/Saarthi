import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

export const ShareModal = ({ roomId, onClose }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); } ;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Invite Others to Join</h2>
                <p className="text-gray-400 mb-6">Share this Room ID with your friends. They can use it on the 'Room' page to join the call.</p>
                <div className="p-4 bg-gray-700 rounded-lg flex justify-between items-center">
                    <span className="font-mono text-xl text-green-400">{roomId}</span>
                    <button onClick={copyToClipboard} className="text-gray-400 hover:text-white">{copied ? <CheckIcon className="w-6 h-6 text-green-400" /> : <CopyIcon className="w-6 h-6" />}</button>
                </div>
                <button onClick={onClose} className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg">Close</button>
            </div>
        </div>
    );
};
