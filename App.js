import './App.css';
import { useState, useEffect, useRef} from 'react';
import congrats from './Resources/sound.mp3';
import backToWork from './Resources/back_to_work_fool.mp3';
import useSound from 'use-sound';


const Header = () => <h1>Study tracking for students</h1>;

function description(work, breakT) {
  return `You go through ${work} minutes of focused hard work without distractions, followed by a ${breakT}-minute break.`;
}

const types = [
  { title: "Pomodoro Technique", work: 25, break: 5, repeat: 8, description: description(25, 5) },
  { title: "50/10 Technique", work: 50, break: 10, repeat: 4, description: description(50, 10) },
  { title: "90-Minute Focus Sessions", work: 90, break: 30, repeat: 2, description: description(90, 30) },
  { title: "52/17 Method", work: 52, break: 17, repeat: 3, description: description(52, 17) },
  { title: "The 2-Hour Focus Block", work: 120, break: 40, repeat: 2, description: description(120, 40) },
  { title: "30/5 Cycle", work: 30, break: 5, repeat: 2, description: description(30, 5) }
];

function App() {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [clock, setClock] = useState("00:00:00");
  const [timer, setTimer] = useState("00:00");
  const [ShowText, setText] = useState("");
  const [playCongrats] = useSound(congrats);
  const [playBackToWork] = useSound(backToWork);
  const timerRef = useRef(timer);
  const condition = useRef("true");

  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    setClock(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }

  function updateBreak(){
    const [minutesNew, secondsNew] = timerRef.current.split(':').map(Number);
    let minutes = minutesNew;
    let seconds = secondsNew;

    if (seconds !== 0) {
      seconds -= 1;
    } else if (seconds === 0) {
      if (minutes > 0) {
        minutes -= 1;
        seconds = 59;
      } else if (minutes === 0) {
        if (condition.current==="mid"){
          return;
        }
        playBackToWork();
        setText('Times up, you finished your break, get to work');
        condition.current="mid";
        setTimeout(() => {
          condition.current="true";
          const minutes = selectedMethod.work;
          setTimer(`${String(minutes).padStart(2, '0')}:00`);
          timerRef.current = `${String(minutes).padStart(2, '0')}:00`;
          setText('');
        }, 5000);

      }
    }

    setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }

  function updateTimer() {
    const [minutesNew, secondsNew] = timerRef.current.split(':').map(Number);
    let minutes = minutesNew;
    let seconds = secondsNew;

    if (seconds !== 0) {
      seconds -= 1;
    } else if (seconds === 0) {
      if (minutes > 0) {
        minutes -= 1;
        seconds = 59;
      } else if (minutes === 0) {
        if (condition.current==="mid"){
          return;
        }
        playCongrats();
        setText('Times up, you finished your study session, you can take a break now.');
        setTimeout(() => {
          condition.current="false";
          const pause=selectedMethod.break;
          setTimer(`${String(pause).padStart(2, '0')}:00`);
          timerRef.current = `${String(pause).padStart(2, '0')}:00`;
          setText('');
        }, 5000)
        }

    }

    setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }

  useEffect(() => {
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedOption && selectedMethod) {
      const minutes = selectedMethod.work;
      setTimer(`${String(minutes).padStart(2, '0')}:00`);
      timerRef.current = `${String(minutes).padStart(2, '0')}:00`; 

      const interval2 = setInterval(() => {
        if(condition.current==="true"){
          updateTimer();
        }
        else if(condition.current==="false"){
          updateBreak();

        }
      }, 1000);
      return () => clearInterval(interval2);
    }
  }, [selectedOption, selectedMethod]);

  const handleChange = (event) => {
    const selected = event.target.value;
    setSelectedOption(selected);
    const method = findType(selected);
    setSelectedMethod(method);
    if (method) {
      setTimer(`${String(method.work).padStart(2, '0')}:00`);
    }
  };

  function findType(selected) {
    return types.find(type => type.title === selected);
  }

  return (
    <div className="App">
      <main>
        <Header />
        <h1 className="clock">{clock}</h1>
        <div className='mainSlides'>
        <section className="creating">
          <p>Please enter a study session and choose a method:</p>
          <label>Choose an option:</label>
          <select id="choices" value={selectedOption} onChange={handleChange}>
            <option value="">-- Select --</option>
            <option value="Pomodoro Technique">Pomodoro Technique</option>
            <option value="50/10 Technique">50/10 Technique</option>
            <option value="90-Minute Focus Sessions">90-Minute Focus Sessions</option>
            <option value="52/17 Method">52/17 Method</option>
            <option value="The 2-Hour Focus Block">The 2-Hour Focus Block</option>
            <option value="30/5 Cycle">30/5 Cycle</option>
          </select>
        </section>
        <br />
        {selectedOption && selectedMethod && (
          <section className="selected">
            <h2 className="header">The used method: {selectedMethod.title}</h2>
            <p>Please put away your phone and anything that could take your attention</p>
            <p>Description: {selectedMethod.description}</p>
            <div className="timer">{timer}</div>
            <p>{ShowText}</p>
          </section>
        )}
        </div>
      </main>
    </div>
  );
}

export default App;