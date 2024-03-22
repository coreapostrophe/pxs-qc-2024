import { Anchor, Box, Button, PageContent, Text } from "grommet";
import Questions from "../assets/questions.json";
import SampleQuestions from "../assets/sample-questions.json";
import {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormPreviousLink } from "grommet-icons";
import { PageKind, usePages } from "../hooks/page";
import { useStorage } from "../hooks/storage";
import { playSfx } from "../utils/sfx";
import ConfettiExplosion, { ConfettiProps } from "react-confetti-explosion";

enum PageState {
  question,
  start,
  finished,
}

function Question(props: {
  question: string;
  author: string;
  handleNext: () => void;
}) {
  return (
    <>
      <Text margin="medium" textAlign="center" size="xxlarge">
        "{props.question}"
      </Text>
      <Text margin={{ bottom: "medium" }} size="medium">
        <em>{props.author}</em>
      </Text>
      <Button label="Next" onClick={props.handleNext} />
    </>
  );
}

function Start(props: {
  hasProgress: boolean;
  totalQuestions: number;
  handleStart: () => void;
  handleReset: () => void;
}) {
  return (
    <>
      <Text margin="medium">
        There's a total of {props.totalQuestions} questions loaded.
      </Text>
      {props.hasProgress ? (
        <Box flex="shrink" direction="row">
          <Button
            margin="xsmall"
            primary
            label="Continue"
            onClick={props.handleStart}
          />
          <Button margin="xsmall" label="Reset" onClick={props.handleReset} />
        </Box>
      ) : (
        <Button
          primary
          margin="xsmall"
          label="Start"
          onClick={props.handleStart}
        />
      )}
    </>
  );
}

function Finished(props: { handleReset: () => void }) {
  return (
    <>
      <Text size="xxlarge" margin="medium">
        Done! 🎉
      </Text>
      <Button margin="xsmall" label="Reset" onClick={props.handleReset} />
    </>
  );
}

function TemporaryConfettiBase(
  props: PropsWithChildren,
  ref: ForwardedRef<{ showConfetti: () => void } | undefined>
) {
  const [showComponent, setShowComponent] = useState(false);

  const showConfetti = () => {
    setShowComponent(true);
  };

  useImperativeHandle(
    ref,
    () => ({
      showConfetti,
    }),
    []
  );

  const handleOnComplete = useCallback(() => {
    setShowComponent(false);
  }, []);

  const confettiConfiguration = useMemo<ConfettiProps>(
    () => ({
      force: 0.8,
      duration: 3000,
      particleCount: 250,
      width: 1600,
      onComplete: handleOnComplete,
    }),
    []
  );

  return (
    <div>
      {showComponent && <ConfettiExplosion {...confettiConfiguration} />}
    </div>
  );
}

const TemporaryConfetti = forwardRef(TemporaryConfettiBase);
const spontaneousQuestionCaption = "Spontaneous Question time!";

function Randomizer() {
  const appEnvironment = import.meta.env.VITE_APP_ENVIRONMENT;
  console.log(appEnvironment);
  const questionsList =
    appEnvironment === "production" ? Questions : SampleQuestions;
  const [pageState, setPageState] = useState(PageState.start);
  const [discoveredQuestionsData, setDiscoveredQuestionsData] = useState<
    string[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    author: "",
    data: "",
  });
  const { setActivePage } = usePages();
  const { getData, saveData } = useStorage();
  const confetti = useRef<{ showConfetti: () => void }>();

  const undiscoveredQuestions = useMemo(
    () =>
      questionsList.filter((question) => {
        return !discoveredQuestionsData.includes(question.data);
      }),
    [questionsList, discoveredQuestionsData]
  );
  const totalQuestions = useMemo(() => questionsList.length, [questionsList]);
  const hasProgress = useMemo(
    () => discoveredQuestionsData.length > 0,
    [discoveredQuestionsData]
  );

  useEffect(() => {
    getData("randomizer", (fetchedQuestionsData) => {
      setDiscoveredQuestionsData(fetchedQuestionsData as string[]);
    });
  }, []);

  useEffect(() => {
    saveData("randomizer", discoveredQuestionsData);
  }, [discoveredQuestionsData]);

  useEffect(() => {
    if (currentQuestion.data.includes(spontaneousQuestionCaption)) {
      playSfx({ kind: "Yay", level: 1, delay: 4000 });
      confetti.current?.showConfetti();
    }
  }, [currentQuestion]);

  const getQuestion = useCallback(() => {
    const randomIndex = Math.floor(
      Math.random() * undiscoveredQuestions.length
    );
    const randomQuestion = undiscoveredQuestions[randomIndex];
    setCurrentQuestion(randomQuestion);
    setDiscoveredQuestionsData((prevState) => {
      const exists = prevState.find(
        (question) => question === randomQuestion.data
      );
      return !exists ? [randomQuestion.data, ...prevState] : prevState;
    });
  }, [undiscoveredQuestions]);

  const handleStart = useCallback(() => {
    setPageState(PageState.question);
    getQuestion();
    playSfx();
  }, [getQuestion]);

  const handleReset = useCallback(() => {
    setDiscoveredQuestionsData([]);
    setPageState(PageState.start);
    playSfx();
  }, [handleStart]);

  const handleNext = useCallback(() => {
    if (!undiscoveredQuestions.length) {
      setPageState(PageState.finished);
    } else {
      getQuestion();
    }
    playSfx({ kind: "Whoosh", level: 1, delay: 500 });
  }, [getQuestion, undiscoveredQuestions]);

  const contentTemplate = useMemo(() => {
    switch (pageState) {
      case PageState.question:
        return (
          <Question
            author={currentQuestion.author}
            question={currentQuestion.data}
            handleNext={handleNext}
          />
        );
      case PageState.finished:
        return <Finished handleReset={handleReset} />;
      default:
        return (
          <Start
            handleReset={handleReset}
            handleStart={handleStart}
            hasProgress={hasProgress}
            totalQuestions={totalQuestions}
          />
        );
    }
  }, [pageState, currentQuestion, totalQuestions, hasProgress]);

  return (
    <PageContent height="100vh">
      <Anchor
        icon={<FormPreviousLink />}
        label="Back"
        onClick={() => {
          setActivePage(PageKind.home);
        }}
      />
      <TemporaryConfetti ref={confetti} />
      <Box height="100vh" align="center" justify="center">
        {contentTemplate}
      </Box>
    </PageContent>
  );
}

export default Randomizer;
