import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CreateSkillTest = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [incorrectAnswers, setIncorrectAnswers] = useState([""]);
  const [content, setContent] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    if (!jobId) {
      navigate("/404");
    }
  }, [jobId, navigate]);

  const addIncorrectInput = () => {
    if (incorrectAnswers.length >= 3) {
      alert("You can only add up to 2 incorrect answers.");
      return;
    }
    setIncorrectAnswers([...incorrectAnswers, ""]);
  };

  const handleIncorrectChange = (index, value) => {
    const updatedAnswers = [...incorrectAnswers];
    updatedAnswers[index] = value;
    setIncorrectAnswers(updatedAnswers);
  };

  const removeIncorrectInput = (index) => {
    const updatedAnswers = incorrectAnswers.filter((_, i) => i !== index);
    setIncorrectAnswers(updatedAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      jobId: parseInt(jobId, 10),
      content: content,
      correctAnswer: correctAnswer,
      incorrectAnswers: incorrectAnswers,
    };

    try {
      const response = await fetch("http://localhost:8080/questions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Question created successfully!");
        navigate(`/questions/view/${jobId}`);
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.message);
      }
    } catch (error) {
      alert("An error occurred: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-800 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl p-6 rounded-lg ">
        <h1 className="text-4xl font-extrabold text-center text-white mb-6">
          Create Skill Test
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-xl shadow-xl transform transition-all hover:scale-105 duration-300"
        >
          <div>
            <label
              htmlFor="question-title"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Question Title
            </label>
            <textarea
              id="question-title"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter question title"
              required
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black-500 shadow-md transition-transform duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="correct-answer"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Correct Answer
            </label>
            <input
              type="text"
              id="correct-answer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter correct answer"
              required
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black-500 shadow-md transition-transform duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="incorrect-answer"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Incorrect Answers
            </label>
            {incorrectAnswers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-2 mt-3">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleIncorrectChange(index, e.target.value)}
                  placeholder="Enter incorrect answer"
                  required
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black-500 shadow-md transition-transform duration-300"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transform transition-all duration-300"
                  onClick={() => removeIncorrectInput(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            {incorrectAnswers.length < 3 && (
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mt-4 transform transition-all duration-300"
                onClick={addIncorrectInput}
              >
                Add Incorrect Answer
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none transition-all duration-300 transform hover:scale-105"
            >
              Create Question
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <a
            href={`/questions/view/${jobId}`}
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transform transition-all duration-300 hover:scale-105"
          >
            View All Questions
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreateSkillTest;