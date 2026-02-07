import React from 'react';

export const VideosPanel = ({ onPlayVideo }) => {
  const videos = [
    {id: 'gG08k_nL_G4', title: 'Introduction to AI'},
    {id: '5q87K1WaoFI', title: 'The Future of Machine Learning'},
    {id: 'kJ5K8oN_s6M', title: 'What is Generative AI?'},
    {id: '0oB9Y-eW18Y', title: 'Ethical AI Explained'}
  ];
  return (
    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
      {videos.map(video => (
        <div key={video.id} className="bg-gray-800 p-2 rounded-lg flex items-center gap-4">
          <img src={`https://img.youtube.com/vi/${video.id}/0.jpg`} alt={video.title} className="w-24 h-16 object-cover rounded"/>
          <button onClick={() => onPlayVideo(video.id)} className="font-semibold hover:text-purple-400 text-left">{video.title}</button>
        </div>
      ))}
    </div>
  );
};
