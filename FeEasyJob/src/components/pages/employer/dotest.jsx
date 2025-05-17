import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../layout/header";

const DoTest = () => {
  const [questions, setQuestions] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const location = useLocation();
  const jobId = location.state?.jobId;

  useEffect(() => {
    // Fetch dữ liệu từ backend
    fetch(`http://localhost:8080/doskilltest?id=${jobId}`)
      .then((response) => response.json())
      .then((data) => {
        setCompanyName(data.companyName);
        setJobCategory(data.jobCategory);
        setQuestions(data.questions);
        setAllAnswers(data.allAnswers);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [jobId]);

  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userConfirmed = window.confirm("Do you want to submit your answers?");
    if (userConfirmed) {
      // Tạo đối tượng chứa câu trả lời
      const answers = {};
      for (const [questionId, answerId] of Object.entries(selectedAnswers)) {
        answers[`question_${questionId}`] = answerId; // Đảm bảo cấu trúc đúng như backend yêu cầu
      }
  console.log(answers);
  console.log(jobId);
      // Gửi dữ liệu lên server
      fetch('http://localhost:8080/submit', {
        credentials: "include",
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          id: jobId,  // Dữ liệu cần gửi lên backend
          ...answers  // Các câu trả lời khác
        })
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            alert("Thank you for completing the test! Your submission has been recorded.");
            // Điều hướng đến trang chi tiết công việc sau khi submit thành công
            window.location.href = `/jobs-detail?jobId=${data.jobId}`;
          } else {
            alert("There was an error submitting your test. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error submitting test:", error);
          alert("There was an error submitting your test. Please try again.");
        });
    }
  };
  

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Modal hướng dẫn */}
      <Header />
      <div
        id="tutorial-modal"
        className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-lg w-3/4 max-w-3xl p-6 text-gray-800">
          <h2 className="text-lg font-bold mb-4">Dear Jobseeker,</h2>
          <p>- You only have one chance to take the test.</p>
          <p>- Your score will be calculated based on correct answers.</p>
          <p className="font-bold text-red-500">- Leaving the page will cancel your test automatically.</p>
          <div className="flex justify-between mt-6">
            <a
              href={`/jobs-detail?jobId=${jobId}`}
              className="btn btn-secondary px-4 py-2 text-gray-100 bg-gray-700 rounded-md"
            >
              Close
            </a>
            <button
              onClick={() =>
                document.getElementById("tutorial-modal").classList.add("hidden")
              }
              className="btn btn-primary px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-gray-800 p-4 flex justify-between items-center">
        <button
          className="text-sm px-4 py-2 border border-gray-400 rounded-md"
          onClick={() =>
            document.getElementById("submit-section").scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          Submit
        </button>
        <div className="text-center">
          <h1 className="text-lg">{companyName}</h1>
          <p className="text-gray-400">{jobCategory}</p>
        </div>
        <a
          href={`/jobs-detail?jobId=${jobId}`}
          className="text-sm px-4 py-2 border border-gray-400 rounded-md"
        >
          X
        </a>
      </nav>

      {/* Content */}
      <form onSubmit={handleSubmit} className="pt-20">
        <div className="container mx-auto p-5 bg-gray-800 rounded-lg">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div
                key={question.questionId}
                className="mb-6 p-4 bg-white rounded-lg text-gray-800"
              >
                <h4 className="font-bold mb-4">
                  Question {index + 1}: {question.content}
                </h4>
                {allAnswers
                  .filter((answer) => answer.question.questionId === question.questionId)
                  .map((answer) => (
                    <div key={answer.answerId} className="mb-3">
                      <input
                        type="radio"
                        id={`answer-${answer.answerId}`}
                        name={`question_${question.questionId}`}
                        value={answer.answerId}
                        className="hidden"
                        onChange={() =>
                          handleAnswerSelect(question.questionId, answer.answerId)
                        }
                      />
                      <label
                        htmlFor={`answer-${answer.answerId}`}
                        className={`block px-4 py-2 rounded-lg cursor-pointer ${
                          selectedAnswers[question.questionId] === answer.answerId
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-gray-700 text-white"
                        } hover:bg-yellow-400`}
                      >
                        {answer.answerText}
                      </label>
                    </div>
                  ))}
              </div>
            ))
          ) : (
            <p className="text-center">No Questions Available</p>
          )}
          <div id="submit-section" className="text-center mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-500 text-gray-800 font-bold rounded-lg"
            >
              Submit Test
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoTest;
