const root = document.getElementById("quiz");
const error = document.getElementById("error");
const errorContainer = document.getElementById("error-container");

const container = document.createElement("div");
const quizContainer = document.createElement("div");
const footerContainer = document.createElement("div");
const btnNext = document.createElement("button");

footerContainer.classList.add("footer-container");
btnNext.classList.add("btn-next");
btnNext.innerText = "Next";

container.appendChild(quizContainer);
footerContainer.appendChild(btnNext);
container.appendChild(footerContainer);
root.appendChild(container);

function constructAnswer(answer) {
  const answerElement = document.createElement("li");
  const radio = document.createElement("input");
  const label = document.createElement("label");

  answerElement.classList.add("answer");

  radio.setAttribute("type", "radio");
  radio.setAttribute("name", "answer");
  radio.setAttribute("id", `answer-${answer.id}`);
  radio.setAttribute("value", answer.correct);

  label.setAttribute("for", `answer-${answer.id}`);
  label.innerText = answer.label;

  answerElement.appendChild(radio);
  answerElement.appendChild(label);

  return answerElement;
}

function fillAnswersToQuestion(answers, answersElement) {
  for (const answer of answers) {
    answersElement.appendChild(constructAnswer(answer));
  }
}

function addQuestionToDom(questionObject) {
  quizContainer.innerHTML = "";
  btnNext.disabled = false;
  const question = document.createElement("h2");
  question.innerText = questionObject.question;
  const answersElement = document.createElement("ul");

  fillAnswersToQuestion(questionObject.answers, answersElement);

  quizContainer.appendChild(question);
  quizContainer.appendChild(answersElement);
}

function showScoreScene() {
  const totalScoreContainer = document.getElementById("total-score-container");
  const totalScoreElement = document.getElementById("total-score");
  totalScoreElement.textContent = localStorage.getItem("quiz_score");

  totalScoreContainer.style.display = "block";
  quizContainer.innerHTML = "";

  btnNext.removeEventListener("click", goToNextQuestion);
  footerContainer.remove();
  quizContainer.remove();
  root.classList.remove("quiz-container");
  localStorage.removeItem("quiz_score");
}

function showErrorScene(err) {
  btnNext.removeEventListener("click", goToNextQuestion);
  footerContainer.remove();
  quizContainer.remove();
  root.classList.remove("quiz-container");

  errorContainer.style.display = "block";
  error.innerText = err.message;
}

async function* getQuestionsSequence() {
  try {
    let startItem = 0;
    while (true) {
      const quizData = await fetch(
        `http://localhost:3000/questions?_start=${startItem++}&_limit=1`
      );
      const [questionObject] = await quizData.json();
      if (!questionObject) break;

      yield addQuestionToDom(questionObject);
    }

    return showScoreScene();
  } catch (err) {
    showErrorScene(err);
  }
}

function disableInputs() {
  const inputs = document.querySelectorAll("input");

  for (const input of inputs) {
    input.disabled = true;
  }
}

const questionsSequence = getQuestionsSequence();
questionsSequence.next();

function updateQuizScore(isCorrect) {
  let quizScore = +localStorage.getItem("quiz_score") || 0;
  localStorage.setItem("quiz_score", isCorrect ? quizScore + 1 : quizScore);
}

function goToNextQuestion() {
  const selectedInput = document.querySelector("input:checked");
  if (!selectedInput) return;

  const label = document.querySelector("input:checked + label");
  const isCorrect = selectedInput.value === "true";

  label.classList.add(isCorrect ? "success" : "failure");
  updateQuizScore(isCorrect);
  disableInputs();

  btnNext.disabled = true;
  setTimeout(() => {
    questionsSequence.next();
  }, 2000);
}

btnNext.addEventListener("click", goToNextQuestion);
