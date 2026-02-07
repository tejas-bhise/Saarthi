import React, { useState } from 'react';

export const QuizPanel = () => {
  const [score, setScore] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let correct = 0;
    if (formData.get('q1') === 'Paris') correct++;
    if (formData.get('q2') === 'Mars') correct++;
    setScore(correct);
  };
  return (
    <div className="flex-grow p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Pop Quiz!</h3>
      {score === null ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="font-semibold">1. What is the capital of France?</p>
            <div className="space-y-1 mt-2">
              <label className="flex items-center"><input type="radio" name="q1" value="London" className="mr-2"/> London</label>
              <label className="flex items-center"><input type="radio" name="q1" value="Paris" className="mr-2"/> Paris</label>
              <label className="flex items-center"><input type="radio" name="q1" value="Berlin" className="mr-2"/> Berlin</label>
            </div>
          </div>
          <div>
            <p className="font-semibold">2. Which is the 'Red Planet'?</p>
            <div className="space-y-1 mt-2">
              <label className="flex items-center"><input type="radio" name="q2" value="Jupiter" className="mr-2"/> Jupiter</label>
              <label className="flex items-center"><input type="radio" name="q2" value="Mars" className="mr-2"/> Mars</label>
              <label className="flex items-center"><input type="radio" name="q2" value="Venus" className="mr-2"/> Venus</label>
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded">Submit</button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-xl">You scored</p>
          <p className="text-4xl font-bold my-2 text-green-400">{score} / 2</p>
          <button onClick={() => setScore(null)} className="mt-4 bg-gray-600 text-white py-2 px-4 rounded">Try Again</button>
        </div>
      )}
    </div>
  );
};
