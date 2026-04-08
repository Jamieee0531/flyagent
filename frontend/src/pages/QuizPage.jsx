import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import quizTree from '../data/quizTree.js';
import { determineType } from '../data/travelTypes.js';
import { getSceneSvg } from '../data/sceneSvg.js';
import './QuizPage.css';

export default function QuizPage() {
  const navigate = useNavigate();
  const [node, setNode] = useState(quizTree);
  const [answers, setAnswers] = useState([]);
  const [dims, setDims] = useState({ escape: 0, pace: 0, nature: 0, solitude: 0, quality: 0 });
  const [questionNum, setQuestionNum] = useState(1);
  const total = 5;

  const handleChoice = useCallback((choice, direction) => {
    const newAnswers = [...answers, { axis: choice.axis, val: choice.val }];
    const newDims = { ...dims };
    if (choice.dims) {
      for (const [k, v] of Object.entries(choice.dims)) {
        newDims[k] = (newDims[k] || 0) + v;
      }
    }

    const nextNode = choice.next;

    if (!nextNode || questionNum >= total) {
      const typeKey = determineType(newAnswers, newDims);
      navigate('/result', { state: { typeKey, dims: newDims, answers: newAnswers } });
      return;
    }

    setAnswers(newAnswers);
    setDims(newDims);
    setNode(nextNode);
    setQuestionNum((n) => n + 1);
  }, [node, answers, dims, questionNum, navigate]);

  if (!node) {
    return (
      <div className="container">
        <div className="quiz-loading">Loading quiz data...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav>
        <div className="logo">
          <span className="logo-mark">N</span>
          Nomie
        </div>
        <span className="nav-label">Travel Soul Quiz</span>
      </nav>

      <div className="progress-wrap">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(questionNum / total) * 100}%` }}
          />
        </div>
        <span className="progress-label">{questionNum} / {total}</span>
      </div>

      <div className="quiz-screen">
        <span className="q-label">{node.choices?.[0]?.axis?.toUpperCase() || ''}</span>
        <h2 className="q-text">{node.question}</h2>

        <div className="choice-grid">
          {node.choices?.map((choice, i) => (
            <div
              key={i}
              className="choice-card"
              onClick={() => handleChoice(choice)}
            >
              <div
                className="choice-scene"
                dangerouslySetInnerHTML={{ __html: getSceneSvg(choice.scene) }}
              />
              <div className="choice-overlay">
                <span className="choice-name">{choice.label}</span>
                <div className="choice-tags">
                  {choice.tags?.map((tag, j) => (
                    <span key={j} className="choice-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
