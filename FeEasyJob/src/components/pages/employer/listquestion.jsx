import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ListQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestionId, setActiveQuestionId] = useState(null); // To manage active question visibility

  // Lấy jobId từ URL
  const { jobId } = useParams();

  // Lấy danh sách câu hỏi từ API
  useEffect(() => {
    fetch(`http://localhost:8080/questions/view/${jobId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false); // Kết thúc trạng thái loading
        if (data.message) {
          // Nếu API trả về thông báo
          setMessage(data.message);
          setQuestions([]); // Đảm bảo danh sách câu hỏi trống
        } else {
          setQuestions(data); // Cập nhật danh sách câu hỏi
        }
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        setLoading(false);
      });
  }, [jobId]);

  // Xử lý sự kiện khi nhấn vào câu hỏi để tải các câu trả lời
  const loadAnswers = (questionId) => {
    fetch(`http://localhost:8080/questions/${questionId}/answers`)
      .then((response) => response.json())
      .then((answers) => {
        if (answers.length > 0) {
          setAnswers(answers);
        } else {
          setAnswers([{ answerText: 'No answers available for this question.' }]);
        }
      })
      .catch((error) => {
        console.error('Error fetching answers:', error);
        setAnswers([{ answerText: 'Error loading answers.' }]);
      });
  };

  // Xử lý khi người dùng nhấn vào câu hỏi
  const handleQuestionClick = (questionId) => {
    if (activeQuestionId === questionId) {
      // Nếu câu hỏi đã được mở, đóng lại
      setActiveQuestionId(null);
    } else {
      // Mở câu hỏi và tải đáp án
      setActiveQuestionId(questionId);
      loadAnswers(questionId);
    }
  };

  // Xử lý xóa câu hỏi
  const handleDeleteClick = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      fetch(`http://localhost:8080/questions/delete/${questionId}`, {
        method: 'GET',
        credentials: 'include',
      })
        .then((response) => {
          if (response.ok) {
            setQuestions(questions.filter((question) => question.questionId !== questionId));
          } else {
            alert('Error deleting question. Please try again.');
          }
        })
        .catch((error) => {
          console.error('Error deleting question:', error);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-white-800 text-white py-6">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-semibold text-center mb-6">Questions</h1>

        {/* Hiển thị thông báo nếu có */}
        {message && (
          <div className="text-red-500 mb-4 text-center">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center text-xl">Loading...</div>
        ) : (
          <>
            {/* Hiển thị danh sách câu hỏi */}
            <ul className="space-y-6">
              {questions.length === 0 ? (
                <li className="text-center text-gray-400">No questions available</li>
              ) : (
                questions.map((question) => (
                  <li
                    key={question.questionId}
                    className="bg-white p-6 rounded-lg shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
                  >
                    {/* Button Question Content và nút "X" nằm trên cùng */}
                    <div className="flex justify-between items-center w-full">
                      <button
                        className="text-xl font-medium text-white bg-black hover:bg-gray-800 px-6 py-3 rounded-lg transition-all duration-300"
                        onClick={() => handleQuestionClick(question.questionId)}
                      >
                        {question.content}
                      </button>

                      <button
                        className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600"
                        onClick={() => handleDeleteClick(question.questionId)}
                      >
                        X
                      </button>
                    </div>

                    {/* Hiển thị đáp án dưới câu hỏi khi câu hỏi được mở */}
                    {activeQuestionId === question.questionId && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {answers.map((answer, index) => (
                          <div
                            key={index}
                            className={`p-6 rounded-lg transition-all duration-300 ease-in-out transform ${
                              answer.answerText === 'No answers available for this question.'
                                ? 'bg-gray-300'
                                : answer.isTrue === 1
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            } hover:scale-105`}
                          >
                            {answer.answerText}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>

            {/* Nút thêm câu hỏi luôn hiển thị */}
            <button
              className="bg-black text-white py-3 px-8 rounded-lg mt-8 block mx-auto text-lg hover:bg-gray-800"
              onClick={() => window.location.href = `/questions/loadskilltest/${jobId}`}
            >
              Add Another Question
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ListQuestion;