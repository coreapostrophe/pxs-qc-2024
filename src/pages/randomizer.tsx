import { Anchor, Box, Button, FileInput, PageContent, Text } from "grommet";
import {
  ChangeEvent,
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
  hasQuestions: boolean;
  totalQuestions: number;
  handleStart: () => void;
  handleReset: () => void;
  handleOnUpload: (event?: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <Text margin="medium" size="xxlarge">
        There's a total of {props.totalQuestions} questions loaded.
      </Text>
      {props.hasProgress ? (
        <Box flex="shrink" direction="row">
          <Button
            margin="xsmall"
            primary
            label="Continue"
            disabled={!props.hasQuestions}
            onClick={props.handleStart}
          />
          <Button margin="xsmall" label="Reset" onClick={props.handleReset} />
        </Box>
      ) : (
        <Button
          primary
          label="Start"
          disabled={!props.hasQuestions}
          margin={{ top: "xsmall", bottom: "medium" }}
          onClick={props.handleStart}
        />
      )}
      <FileInput name="file" multiple={false} onChange={props.handleOnUpload} />
      <Text margin={{ vertical: "medium" }} size="medium" color="dark-2">
        <em>File should be of type .csv with two columns: "author,question"</em>
      </Text>
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
const spontaneousQuestionCaption = "spontaneous question";

function Randomizer() {
  const [pageState, setPageState] = useState(PageState.start);
  const [questionsList, setQuestionsList] = useState<
    { author: string; data: string }[]
  >([]);
  const [discoveredQuestions, setDiscoveredQuestions] = useState<string[]>([]);
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
        return !discoveredQuestions.includes(question.data);
      }),
    [questionsList, discoveredQuestions]
  );
  const totalQuestions = useMemo(() => questionsList.length, [questionsList]);
  const hasQuestions = useMemo(() => totalQuestions > 0, [totalQuestions]);
  const hasProgress = useMemo(
    () => discoveredQuestions.length > 0,
    [discoveredQuestions]
  );

  console.log(discoveredQuestions);
  console.log(undiscoveredQuestions);
  console.log(questionsList);

  useEffect(() => {
    getData("randomizer", (fetchedDiscoveredQuestionsData) => {
      setDiscoveredQuestions(fetchedDiscoveredQuestionsData as string[]);
    });
    getData("questions", (fetchedQuestionsData) => {
      setQuestionsList(
        fetchedQuestionsData as { author: string; data: string }[]
      );
    });
  }, []);

  useEffect(() => {
    saveData("randomizer", discoveredQuestions);
  }, [discoveredQuestions]);

  useEffect(() => {
    saveData("questions", questionsList);
  }, [questionsList]);

  useEffect(() => {
    if (
      currentQuestion.data.toLowerCase().includes(spontaneousQuestionCaption)
    ) {
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
    setDiscoveredQuestions((prevState) => {
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
    setDiscoveredQuestions([]);
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

  const handleOnUpload = useCallback(
    (event?: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target.files?.[0] ?? undefined;
      console.log(file?.name);
      if (file !== undefined && file.name.includes("csv")) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
          if (typeof reader.result === "string") {
            const csvArray = reader.result.split("\n").map((token) => {
              const [author = "", data = ""] = token.split(",");
              return { author, data };
            });
            setQuestionsList(csvArray);
          } else if (!!reader.result) {
            const decoder = new TextDecoder();
            const decodedResult = decoder.decode(reader.result);
            const csvArray = decodedResult.split("\n").map((token) => {
              const [author, data] = token.split(",");
              return { author, data };
            });
            setQuestionsList(csvArray);
          }
        };
        reader.onerror = function () {
          console.error(reader.error);
        };
      }
    },
    []
  );

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
            hasQuestions={hasQuestions}
            handleOnUpload={handleOnUpload}
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
