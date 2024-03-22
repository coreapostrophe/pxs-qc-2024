import { Anchor, Box, Button, PageContent, Text } from "grommet";
import Questions from "../assets/questions.json";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormPreviousLink } from "grommet-icons";
import { PageKind, usePages } from "../hooks/page";
import { useStorage } from "../hooks/storage";

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

function Randomizer() {
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

  const undiscoveredQuestions = useMemo(
    () =>
      Questions.filter((question) => {
        return !discoveredQuestionsData.includes(question.data);
      }),
    [Questions, discoveredQuestionsData]
  );
  const totalQuestions = useMemo(() => Questions.length, [Questions]);
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
  }, [getQuestion]);

  const handleReset = useCallback(() => {
    setDiscoveredQuestionsData([]);
    setPageState(PageState.start);
  }, [handleStart]);

  const handleNext = useCallback(() => {
    console.log(undiscoveredQuestions);
    if (!undiscoveredQuestions.length) {
      setPageState(PageState.finished);
    } else {
      getQuestion();
    }
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
      <Box height="100vh" align="center" justify="center">
        {contentTemplate}
      </Box>
    </PageContent>
  );
}

export default Randomizer;
