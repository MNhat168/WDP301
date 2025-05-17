import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SkillTestMark = ({}) => {
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionAnswersMap, setQuestionAnswersMap] = useState({});
  const [point, setPoint] = useState(0);
  const location = useLocation();
  const [data, setData] = useState(null);
  useEffect(() => {
    // Parse query parameters từ URL
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("userId");
    const jobId = queryParams.get("jobId");

    // Fetch skill test result from backend
    fetch(
      `http://localhost:8080/skill-test-result?userId=${userId}&jobId=${jobId}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setJob(data.job);
        setCompany(data.company);
        setUser(data.user);
        setQuestions(data.questions);
        setQuestionAnswersMap(data.questionAnswersMap);
        setPoint(data.point);
      })
      .catch((error) =>
        console.error("Error fetching skill test result:", error)
      );
  }, []);

  if (!job || !company || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="px-5 py-5 text-center container-fluid bg-yellow-100 rounded-lg mt-[-46px]">
        <div className="p-5">
          <p
            className="text-black text-6xl font-normal pb-5 mt-5"
            style={{ fontFamily: '"Poppins", sans-serif' }}
          >
            Skill Test Result
          </p>
          <div className="flex justify-center gap-10 px-5">
            {/* Job Info */}
            <div className="mt-5 p-3 bg-white border-2 border-black rounded-3xl w-1/4">
              <h3>{job.title}</h3>
              <hr />
              <ul className="text-xl">
                <li>
                  Company: <b>{company.companyName}</b>
                </li>
                <li>
                  Job Position: <b>{job.category.categoryName}</b>
                </li>
                <li>
                  Year Experience: <b>{job.experienceYears}</b>
                </li>
                <li>
                  Salary: <b>{job.salary}</b>
                </li>
                <li>
                  Location: <b>{job.location}</b>
                </li>
              </ul>
            </div>

            {/* User Info */}
            <div className="mt-5 ml-5 p-3 bg-white border-2 border-black rounded-3xl w-1/4">
              <h3>
                {user.firstName} {user.lastName}
              </h3>
              <h6>
                <i style={{ color: "#666666" }}>{user.email}</i>
              </h6>
              <hr />
              <h1 className="text-6xl">
                {point} / {questions.length}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Questions and Answers */}
      <div className="container p-5 bg-dark rounded-lg mt-[-46px]">
        <div className="col">
          {/* Loop through questions */}
          {questions.map((question) => (
            <div
              className="row p-4 mb-4 question-block bg-white rounded-lg"
              key={question.questionId}
            >
              <div className="col">
                <h4>
                  <b className="text-gray-600">Question:</b>
                  <span>{question.content}</span>
                </h4>
                <hr />
                <div className="flex gap-4 px-3">
                  {/* Loop through answers */}
                  {question.answers.map((answer) => (
                    <div
                      className={`col-5 p-4 mt-3 mx-4 rounded-lg ${
                        answer.true && answer.chosen
                          ? "bg-green-500 text-white"
                          : answer.true
                          ? "bg-green-500 text-white"
                          : answer.chosen
                          ? "bg-red-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                      key={answer.answerId}
                    >
                      <span>{answer.answerText}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={() => window.close()}
          className="btn btn-lg btn-outline-light"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default SkillTestMark;
