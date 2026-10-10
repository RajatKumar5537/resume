import type { ConceptGroupId, ConceptLesson } from "./concepts";
import { ADVANCED } from "./selenium-advanced";

const BASIS = "Prepared interview explanation. It is not a quotation from a saved PDF or Java file.";
const SEL = "Interview_PDF/SELENIUM.pdf";
const POP = "Interview_PDF/Pop-Up Selenium.pdf";

export const SELENIUM_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "se-basics", title: "Selenium Fundamentals" },
  { id: "se-locators", title: "Locators and XPath" },
  { id: "se-driver", title: "Driver, Elements, and JavaScript" },
  { id: "se-waits", title: "Waits" },
  { id: "se-popups", title: "Alerts, Windows, and Popups" },
  { id: "se-actions", title: "Actions and Select" },
  { id: "se-files", title: "Excel, Files, and Screenshots" },
  { id: "se-testng", title: "TestNG" },
  { id: "se-parallel", title: "Parallel Execution and Grid" },
  { id: "se-exceptions", title: "Exceptions" },
  { id: "se-pages", title: "Dynamic Elements and Page Objects" },
  { id: "se-advanced", title: "Advanced Selenium and SDET" },
];

const PROGRAMS = [
  "src/main/java/Selenium/Alert_Popup.java",
  "src/main/java/Selenium/Authentication_Popup.java",
  "src/main/java/Selenium/ChildWindow_Popup.java",
  "src/main/java/Selenium/CloseAllChildWindow.java",
  "src/main/java/Selenium/CloseAllWithourQuit.java",
  "src/main/java/Selenium/File_Upload_Popup.java",
  "src/main/java/Selenium/HiddenDivision_Popup.java",
  "src/main/java/Selenium/Notification_Popup.java",
  "src/main/java/Selenium/Print_All_Links.java",
  "src/main/java/Selenium/Print_All_Options.java",
  "src/main/java/Selenium/Print_Auto_Suggestion.java",
  "src/main/java/Selenium/Print_Popup.java",
  "src/main/java/Selenium/WebUtilities.java",
  "src/main/java/Selenium/Window_Handle_Popup.java",
];

export const SELENIUM_PATHS = [SEL, POP, ...PROGRAMS];

function pdf(label: string, path: string, focus: string): ConceptLesson["sources"] {
  return [{ label, path, kind: "pdf", focus }];
}

function javaFile(path: string): ConceptLesson["sources"][number] {
  return { label: path.split("/").pop() || path, path, kind: "java" };
}

export const SELENIUM_CONCEPTS: ConceptLesson[] = [
  {
    id: "se-advantages",
    group: "se-basics",
    title: "What are the advantages and disadvantages of Selenium?",
    aliases: ["advantages of selenium", "disadvantages of selenium", "selenium limitations"],
    basis: BASIS,
    summary:
      "Selenium is free and open source. It automates web applications across browsers and operating systems. It does not automate desktop applications, and it has no built-in report.",
    simple:
      "I use Selenium when the product under test is a website. I choose another tool when the work is a desktop window, a captcha, or an image comparison.",
    points: [
      "It is open source and free.",
      "It supports cross-browser testing.",
      "It supports more than one programming language.",
      "It runs on Windows, macOS, and Linux.",
      "It integrates with tools such as Jenkins and Maven.",
      "Selenium Grid supports parallel execution.",
      "It has an active community.",
      "It is limited to web applications.",
      "It has no built-in reporting.",
      "It requires programming knowledge.",
      "Dynamic pages need maintenance.",
      "There is no official technical support in the saved note.",
      "It has no native image-based testing.",
      "Captcha and OTP flows are difficult.",
      "It has limited control over system-level browser operations.",
    ],
    how: "The saved note says Selenium supports multiple languages. It does not list them. The usual bindings are Java, Python, C#, JavaScript, and Ruby. The parallel example later names Chrome, Firefox, and Edge.",
    sources: pdf("SELENIUM.pdf, page 1", SEL, "advantages"),
    related: ["se-webdriver", "se-grid"],
  },
  {
    id: "se-webdriver",
    group: "se-basics",
    title: "What is Selenium WebDriver?",
    aliases: ["selenium webdriver", "what is webdriver"],
    basis: BASIS,
    summary:
      "WebDriver is the API that drives a real browser. My test code calls WebDriver. The browser driver carries out those commands.",
    simple:
      "get() opens a page. findElement() finds a control. click() and sendKeys() use that control. quit() ends the browser session.",
    points: [
      "WebDriver talks to the browser. It does not use a Selenium IDE recording.",
      "The saved note connects Selenium with Maven and Jenkins.",
      "The same note names Selenium Grid for parallel runs.",
      "A test should create its own driver and quit that driver.",
    ],
    how: "The saved Selenium note lists WebDriver methods. It does not give a separate definition paragraph. This answer is the interview explanation of that method list.",
    sources: pdf("SELENIUM.pdf, page 2", SEL, "webdriver"),
    related: ["se-webdriver-methods", "se-advantages", "se-parallel"],
  },
  {
    id: "se-locators",
    group: "se-locators",
    title: "What are the Selenium locator strategies?",
    aliases: ["locators", "by id", "css selector", "eight locators"],
    basis: BASIS,
    summary: "A locator tells Selenium which element to use. The saved note lists eight strategies.",
    simple: "I prefer a stable id. I use CSS or XPath when the element has no stable id.",
    points: [
      "id uses By.id.",
      "name uses By.name.",
      "className uses By.className.",
      "tagName uses By.tagName.",
      "linkText matches the full link text.",
      "partialLinkText matches part of the link text.",
      "cssSelector uses a CSS selector.",
      "xpath uses an XPath expression.",
    ],
    example: {
      code: `By submit = By.id("submit");
By email = By.name("email");
By button = By.cssSelector("button.primary");
By label = By.xpath("//label[text()='Email']");`,
      output: "These are locator objects. They do not click anything until findElement uses them.",
    },
    how: "className matches one class token. A value with a space is not one class name. linkText is for anchor text, not for a button label.",
    sources: pdf("SELENIUM.pdf, page 1", SEL, "locators"),
    related: ["se-xpath", "se-find-element"],
  },
  {
    id: "se-xpath",
    group: "se-locators",
    title: "How do you write XPath in Selenium?",
    aliases: ["xpath", "relative xpath", "contains xpath", "normalize-space"],
    basis: BASIS,
    summary:
      "Relative XPath starts with //. It can match a tag, an attribute, visible text, or a partial value. The saved note also shows index, last(), and normalize-space().",
    simple: "I start with a stable attribute. I use contains or text only when the attribute is not stable.",
    points: [
      "Tag: //tagname.",
      "Attribute: //tagname[@attribute='value'].",
      "Exact text: //tagname[text()='textValue'].",
      "Partial attribute: //tagname[contains(@attribute,'partialValue')].",
      "Partial text: //tagname[contains(text(),'partialText')].",
      "Class attribute: //tagname[@class='classname'].",
      "Index: //tagname[index]. XPath indexes start at 1.",
      "Any element: //*.",
      "Last match: //tagname[last()].",
      "Trimmed text: //tagname[contains(normalize-space(),'text')].",
      "starts-with(@id,'user') matches a prefix. The saved note does not show this form.",
      "//input[@type='text' or @type='email'] matches either attribute. The saved note does not show or.",
      "An independent and dependent XPath finds a stable text, then moves to the related control. The saved note does not name that pattern.",
      "A traversing step uses an axis such as parent:: or following-sibling::. The saved note does not show axes.",
    ],
    example: {
      code: `By email = By.xpath("//input[@name='email']");
By partial = By.xpath("//button[contains(text(),'Sign')]");
By second = By.xpath("(//button)[2]");`,
      output: "Each line builds a By. findElement uses it to search the page.",
    },
    how: "The saved note prints normalize- space() with a space. The XPath function is normalize-space() with no space. (//button)[2] is group indexing. It is brittle because the button order can change. The Flipkart example in the popup note uses that index.",
    sources: [
      ...pdf("SELENIUM.pdf, pages 1-2", SEL, "xpath"),
      ...pdf("Pop-Up Selenium.pdf, page 2", POP, "xpath"),
    ],
    related: ["se-locators", "se-dynamic", "se-hidden-calendar"],
  },
  {
    id: "se-find-element",
    group: "se-driver",
    title: "What is the difference between findElement and findElements?",
    aliases: ["findelement", "findelements", "find element vs find elements"],
    basis: BASIS,
    summary:
      "findElement() returns the first matching element. It throws NoSuchElementException when nothing matches. findElements() returns a list. That list is empty when nothing matches.",
    simple: "I use findElement() when the test needs one control. I use findElements() when I need every match, or when zero matches is a valid result.",
    example: {
      code: `WebElement button = driver.findElement(By.id("submit"));
List<WebElement> buttons = driver.findElements(By.tagName("button"));`,
      output: "The first call returns one element or throws. The second call returns a list that may be empty.",
    },
    points: [
      "findElement() returns one element.",
      "findElements() returns a list.",
      "An empty list is not an exception.",
      "SearchContext is the interface that declares both methods.",
      "WebDriver and WebElement both extend the search behavior. A search from a WebElement stays inside that element.",
    ],
    sources: pdf("SELENIUM.pdf, pages 2 and 8", SEL, "findelement"),
    related: ["se-locators", "se-exceptions", "se-webelement"],
  },
  {
    id: "se-webdriver-methods",
    group: "se-driver",
    title: "Which WebDriver methods should I remember?",
    aliases: ["webdriver methods", "close vs quit", "getwindowhandle"],
    basis: BASIS,
    summary:
      "WebDriver opens pages, reads the browser state, and switches context. close() closes the current window. quit() ends the whole session.",
    simple: "I call quit() in a finally block so a failed test still releases the browser.",
    points: [
      "get() opens a URL.",
      "getCurrentUrl() returns the current URL.",
      "getPageSource() returns the page source.",
      "getTitle() returns the title.",
      "getWindowHandle() returns the current window id.",
      "getWindowHandles() returns every open window id.",
      "manage() reaches timeouts, cookies, and the window.",
      "navigate() can move back, forward, and refresh.",
      "close() closes the current window.",
      "quit() closes every window and ends the session.",
      "switchTo() moves to an alert, frame, or window.",
      "The saved note spells Close() with a capital C. The Java method is close().",
    ],
    how: "CloseAllWithourQuit.java closes every handle in a loop. That is a saved way to close windows without one quit() call. quit() is still the normal cleanup.",
    sources: [
      ...pdf("SELENIUM.pdf, page 2", SEL, "getwindowhandles"),
      javaFile("src/main/java/Selenium/CloseAllWithourQuit.java"),
      javaFile("src/main/java/Selenium/CloseAllChildWindow.java"),
    ],
    related: ["se-windows", "se-alerts", "se-screenshot"],
  },
  {
    id: "se-webelement",
    group: "se-driver",
    title: "Which WebElement methods should I remember?",
    aliases: ["webelement methods", "gettext vs getattribute", "isdisplayed"],
    basis: BASIS,
    summary:
      "WebElement is one control on the page. click() and sendKeys() use it. getText() reads visible text. getAttribute() reads an attribute value.",
    simple:
      "isDisplayed() asks whether the element is shown. isEnabled() asks whether it can be used. isSelected() asks whether a checkbox, radio button, or option is selected.",
    points: [
      "clear() removes the current input value.",
      "click() clicks the element.",
      "sendKeys() types into the element. The saved note spells it sendkeys().",
      "submit() submits a form from an element inside that form.",
      "getText() returns visible text.",
      "getAttribute() returns the named attribute.",
      "getCssValue() returns a computed style.",
      "getTagName() returns the tag.",
      "getLocation(), getSize(), and getRect() describe position and size.",
      "isDisplayed(), isEnabled(), and isSelected() are three different checks.",
    ],
    how: "getText() does not return the value of an input. For an input I read the value attribute, or I use getDomProperty(\"value\") on current Selenium. A hidden element can make click() throw ElementNotInteractableException.",
    sources: pdf("SELENIUM.pdf, page 2", SEL, "isdisplayed"),
    related: ["se-find-element", "se-select", "se-javascript"],
  },
  {
    id: "se-javascript",
    group: "se-driver",
    title: "How do you use JavascriptExecutor?",
    aliases: ["javascriptexecutor", "scroll into view", "execute script"],
    basis: BASIS,
    summary:
      "JavascriptExecutor runs JavaScript in the browser. executeScript() runs it and returns a value. executeAsyncScript() is for script that finishes with a callback.",
    simple:
      "I scroll with window.scrollBy or scrollIntoView. I still prefer click() and sendKeys() when the element is ready. JavaScript is the fallback, not the default.",
    example: {
      code: `JavascriptExecutor js = (JavascriptExecutor) driver;
js.executeScript("window.scrollBy(0,1000)");
WebElement element = driver.findElement(By.id("element_id"));
js.executeScript("arguments[0].scrollIntoView(true);", element);
js.executeScript("arguments[0].value='your input text';", element);`,
      output: "The page scrolls. The last call sets the input value in the DOM. It was not executed in this project.",
    },
    points: [
      "Scroll by pixels with window.scrollBy(0,1000).",
      "Scroll to an element with arguments[0].scrollIntoView(true).",
      "Set an input with arguments[0].value when sendKeys() cannot type.",
      "A JavaScript click can skip the checks a real user click would hit.",
      "WebUtilities.java also scrolls by pixels and by the element location.",
    ],
    how: "Setting value with JavaScript may not fire the input events the application expects. I use it when the field is covered or disabled for a test-only reason, and I say that in the interview.",
    sources: [
      ...pdf("SELENIUM.pdf, pages 2-3", SEL, "executescript"),
      javaFile("src/main/java/Selenium/WebUtilities.java"),
    ],
    related: ["se-actions", "se-webelement"],
  },
  {
    id: "se-screenshot",
    group: "se-files",
    title: "How do you take a screenshot in Selenium?",
    aliases: ["screenshot", "takesscreenshot", "getscreenshotas"],
    basis: BASIS,
    summary: "TakesScreenshot can capture the browser as a file. getScreenshotAs() returns that image. I then copy it to a file path.",
    simple: "The destination must be a file, such as screenshot.png. A folder path alone is not a file.",
    example: {
      code: `TakesScreenshot camera = (TakesScreenshot) driver;
File source = camera.getScreenshotAs(OutputType.FILE);
File destination = new File(System.getProperty("user.dir") + "/screenshot.png");
FileUtils.copyFile(source, destination);`,
      output: "A PNG file is written on disk. This snippet needs a live driver and Apache Commons IO. It was not executed here.",
    },
    points: [
      "Cast the driver to TakesScreenshot.",
      "OutputType.FILE returns a temporary file.",
      "FileUtils.copyFile comes from Apache Commons IO.",
      "WebUtilities.java contains the saved screenshot helper.",
    ],
    how: "The saved note builds the destination as a ScreenShot directory and passes it to copyFile. copyFile expects a file. The corrected example uses screenshot.png.",
    questions: [
      {
        prompt: "How do you capture evidence when a test fails?",
        short: "I save a screenshot and the exception text with the test name. Browser console logs help when the page failed in script rather than in a locator.",
        detail: "I attach that evidence to the report. I do not rely on a screenshot that was taken only after the browser had already closed.",
      },
    ],
    sources: [
      ...pdf("SELENIUM.pdf, page 4", SEL, "screenshot"),
      javaFile("src/main/java/Selenium/WebUtilities.java"),
    ],
    related: ["se-webdriver-methods", "se-excel", "se-ci-failure"],
  },
  {
    id: "se-waits",
    group: "se-waits",
    title: "What is the difference between implicit, explicit, and fluent wait?",
    aliases: ["implicit wait", "explicit wait", "fluent wait", "webdriverwait"],
    basis: BASIS,
    summary:
      "An implicit wait applies a default timeout to element searches. An explicit wait waits for one condition. A fluent wait polls that condition until the timeout.",
    simple:
      "I prefer an explicit wait for a known condition. Thread.sleep is a fixed pause. It does not know when the page is ready.",
    example: {
      code: `driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
wait.until(ExpectedConditions.elementToBeClickable(locator));
Alert alert = wait.until(ExpectedConditions.alertIsPresent());`,
      output: "The wait returns when the condition is true. It throws TimeoutException when the time runs out. It was not executed here.",
    },
    points: [
      "Implicit wait: one timeout for findElement searches.",
      "Explicit wait: one condition, such as visible, present, or clickable.",
      "Fluent wait: the same idea, with a polling interval and exceptions it can ignore.",
      "The saved conditions are visibility, presence, clickable, titleContains, titleIs, text present, selected, and alertIsPresent.",
      "invisibilityOfElementLocated waits until an element is gone. The saved note does not list that condition.",
      "Do not mix a long implicit wait with an explicit wait. The implicit wait can still delay the explicit search.",
      "The saved explicit examples use Duration.ofSeconds. That is Selenium 4 syntax.",
    ],
    how: "The saved note calls fluent wait an explicit wait that checks repeatedly. It does not include a FluentWait code sample. A FluentWait can set withTimeout, pollingEvery, and ignoring(NoSuchElementException.class). ExpectedConditions.presenceOfElementLocated means the element is in the DOM. visibility means it is displayed.",
    questions: [
      {
        prompt: "How do you use explicit waits correctly?",
        short: "I wait for the condition the next step needs, such as visible or clickable. I keep the timeout near the real response time.",
        detail: "A fixed sleep does not know that the page is ready. A long implicit wait plus an explicit wait can make a failure look slower than it is.",
      },
    ],
    sources: pdf("SELENIUM.pdf, pages 4-5", SEL, "implicit"),
    related: ["se-ajax", "se-exceptions", "se-dynamic", "se-suite-speed"],
  },
  {
    id: "se-alerts",
    group: "se-popups",
    title: "How do you handle a JavaScript alert?",
    aliases: ["alert", "javascript alert", "switchto alert"],
    basis: BASIS,
    summary:
      "A JavaScript alert is a browser dialog. I switch to it with switchTo().alert(). accept() presses OK. dismiss() presses Cancel.",
    simple: "I cannot inspect this dialog in the page DOM. I wait until the alert is present, read it, and then accept or dismiss it.",
    example: {
      code: `WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.alertIsPresent());
Alert alert = driver.switchTo().alert();
String text = alert.getText();
alert.accept();
System.out.println(text);`,
      output: "The alert text is printed and the dialog closes. Alert_Popup.java is the saved program. It was not executed here.",
    },
    points: [
      "accept() clicks OK.",
      "dismiss() clicks Cancel. The saved note spells it Cancle.",
      "getText() returns the dialog text.",
      "sendKeys() types into a prompt dialog, and then accept() closes it.",
      "The dialog sits under the address bar. It cannot be dragged.",
      "An alert with only OK is an alert. OK and Cancel is a confirmation.",
    ],
    sources: [
      ...pdf("SELENIUM.pdf, page 3", SEL, "alert"),
      ...pdf("Pop-Up Selenium.pdf, page 1", POP, "alert"),
      javaFile("src/main/java/Selenium/Alert_Popup.java"),
    ],
    related: ["se-popup-kinds", "se-waits"],
  },
  {
    id: "se-frames",
    group: "se-popups",
    title: "How do you switch to a frame?",
    aliases: ["frames", "switchto frame", "defaultcontent"],
    basis: BASIS,
    summary: "A frame is another document inside the page. switchTo().frame() enters it. defaultContent() returns to the main page.",
    simple: "I switch into the frame before I look for its elements. I switch back before I use the rest of the page.",
    example: {
      code: `driver.switchTo().frame("frame-name");
driver.findElement(By.id("inside")).click();
driver.switchTo().parentFrame();
driver.switchTo().defaultContent();`,
      output: "The search moves into the frame and then back out. The saved note shows switchTo().frame() only.",
    },
    points: [
      "frame() accepts an index, a name or id, or a WebElement.",
      "parentFrame() moves up one frame.",
      "defaultContent() returns to the top document.",
      "The saved Selenium note does not show defaultContent() or parentFrame().",
    ],
    sources: pdf("SELENIUM.pdf, page 3", SEL, "frame"),
    related: ["se-windows", "se-webdriver-methods"],
  },
  {
    id: "se-popup-kinds",
    group: "se-popups",
    title: "What kinds of popups does the Selenium note cover?",
    aliases: ["popup types", "types of popup", "selenium popups"],
    basis: BASIS,
    summary: "The popup note uses different code for different dialogs. A DOM popup can be inspected. A browser or operating-system dialog cannot.",
    simple: "I identify the popup first. Then I choose alert, a locator, browser options, a URL, window handles, or an OS tool.",
    points: [
      "JavaScript alert.",
      "Hidden division popup.",
      "Calendar popup. The note groups it with the hidden division.",
      "File upload popup.",
      "File download popup.",
      "Print popup.",
      "Notification popup.",
      "Authentication popup.",
      "Child window or child browser.",
      "AJAX popup. This is a later question in the same note, not item 1 through 8.",
    ],
    sources: pdf("Pop-Up Selenium.pdf, page 1", POP, "pop-up"),
    related: ["se-alerts", "se-hidden-calendar", "se-file-upload", "se-windows", "se-ajax"],
  },
  {
    id: "se-hidden-calendar",
    group: "se-popups",
    title: "How do you handle a hidden division or calendar popup?",
    aliases: ["hidden division", "calendar popup", "html popup"],
    basis: BASIS,
    summary: "A hidden division is HTML. I can inspect it. I close or use it with findElement(), the same way I use any other element.",
    simple: "A calendar widget is the same kind of popup in the saved note. I click the date element. I do not use switchTo().alert().",
    example: {
      code: `driver.get("https://www.flipkart.com/");
driver.findElement(By.xpath("(//button)[2]")).click();`,
      output: "The saved example clicks the second button. The index can change, so I prefer a stable locator.",
    },
    points: [
      "The popup can be inspected.",
      "The note says it cannot be moved.",
      "findElement() is the solution in the note.",
      "HiddenDivision_Popup.java is the saved program.",
    ],
    how: "The XPath (//button)[2] is group indexing. It is the original example. It is not a stable locator for a live site.",
    sources: [
      ...pdf("Pop-Up Selenium.pdf, page 2", POP, "hidden"),
      javaFile("src/main/java/Selenium/HiddenDivision_Popup.java"),
    ],
    related: ["se-popup-kinds", "se-xpath"],
  },
  {
    id: "se-file-upload",
    group: "se-files",
    title: "How do you upload a file in Selenium?",
    aliases: ["file upload", "sendkeys file", "upload popup"],
    basis: BASIS,
    summary: "For an input of type file, I send the absolute file path with sendKeys(). I do not click the OS file dialog when that input exists.",
    simple: "The path must be absolute. The element must be the file input, not the styled button on top of it.",
    example: {
      code: `File file = new File("data/sample.png");
String absolutePath = file.getAbsolutePath();
fileInputElement.sendKeys(absolutePath);`,
      output: "The browser receives the file path. No OS dialog needs to be clicked. It was not executed here.",
    },
    points: [
      "The saved method is selectFileToUpload.",
      "File_Upload_Popup.java is the saved program.",
      "sendKeys() does not type into a Windows file dialog.",
      "If there is no file input, Selenium cannot see the OS dialog.",
    ],
    sources: [
      ...pdf("SELENIUM.pdf, page 4", SEL, "upload"),
      javaFile("src/main/java/Selenium/File_Upload_Popup.java"),
    ],
    related: ["se-popup-kinds", "se-download-print"],
  },
  {
    id: "se-download-print",
    group: "se-popups",
    title: "How does the note handle file download and print popups?",
    aliases: ["file download", "print popup", "robot class"],
    basis: BASIS,
    summary:
      "The note uses the Robot class for the download dialog and the print dialog. Those dialogs are outside the page, so findElement() cannot see them.",
    simple: "Robot is a Java class in java.awt. keyPress() and keyRelease() send keyboard keys to the operating system.",
    points: [
      "The download dialog can be moved. It cannot be inspected.",
      "The note mentions Open with, Save File, OK, and Cancel.",
      "The print dialog cannot be moved or inspected.",
      "The note says the print dialog has Print and Cancel.",
      "Robot works on the machine desktop. It is a weak choice on Selenium Grid or a headless browser.",
      "A Chrome download directory preference avoids the download dialog.",
    ],
    how: "The saved note does not include a finished Robot key sequence. It names keyPress and keyRelease. I keep Robot as the original solution and I name its limit.",
    sources: pdf("Pop-Up Selenium.pdf, page 2", POP, "robot"),
    related: ["se-popup-kinds", "se-file-upload"],
  },
  {
    id: "se-notification",
    group: "se-popups",
    title: "How do you handle a browser notification popup?",
    aliases: ["notification popup", "disable notifications", "chromeoptions"],
    basis: BASIS,
    summary: "A notification prompt asks to allow or block notifications. The note stops it before it appears by starting Chrome with notifications disabled.",
    simple: "I cannot inspect this prompt as a page element. I change the browser setting with ChromeOptions.",
    example: {
      code: `ChromeOptions options = new ChromeOptions();
options.addArguments("--disable-notifications");
ChromeDriver driver = new ChromeDriver(options);
driver.get("https://www.yatra.com/");`,
      output: "Chrome starts with the notification prompt suppressed. The saved note uses this argument.",
    },
    points: [
      "The prompt has Allow and Block.",
      "It appears near the address bar.",
      "The note uses addArguments. Current ChromeOptions also has addArguments with the same spelling.",
      "Notification_Popup.java is the saved program.",
    ],
    sources: [
      ...pdf("Pop-Up Selenium.pdf, page 3", POP, "notification"),
      javaFile("src/main/java/Selenium/Notification_Popup.java"),
    ],
    related: ["se-popup-kinds", "se-auth"],
  },
  {
    id: "se-auth",
    group: "se-popups",
    title: "How does the note handle an authentication popup?",
    aliases: ["authentication popup", "basic auth", "username password url"],
    basis: BASIS,
    summary:
      "The saved note passes the username and password inside the URL. The browser then opens the basic-auth page without showing the dialog.",
    simple: "The dialog itself cannot be inspected. It has username, password, Sign in, and Cancel.",
    example: {
      code: `driver.get("https://admin:admin@the-internet.herokuapp.com/basic_auth");`,
      output: "The original example opens the basic-auth page as admin. Credentials in a URL can be logged. Encode reserved characters.",
    },
    points: [
      "The note also calls WebDriverManager.chromedriver().setup() before creating ChromeDriver.",
      "The same example uses Thread.sleep(2000). That is a fixed wait.",
      "Selenium 4.6 and later can resolve the driver with Selenium Manager, so WebDriverManager is optional.",
      "Authentication_Popup.java is the saved program.",
    ],
    how: "Putting a password in the URL can expose it in logs, history, and reports. Some current Chrome versions also limit embedded credentials. I can still explain the saved technique, and I mention that limit in the interview.",
    sources: [
      ...pdf("Pop-Up Selenium.pdf, page 3", POP, "authentication"),
      javaFile("src/main/java/Selenium/Authentication_Popup.java"),
    ],
    related: ["se-popup-kinds", "se-waits"],
  },
  {
    id: "se-windows",
    group: "se-popups",
    title: "How do you handle a child browser window?",
    aliases: ["child window", "window handles", "switchto window"],
    basis: BASIS,
    summary:
      "A child browser is a real window. I can inspect it. getWindowHandles() returns every window id. switchTo().window() moves to one id.",
    simple: "I save the parent id first. I switch to the new id. I close the child when I am finished, and then I switch back to the parent.",
    example: {
      code: `String parent = driver.getWindowHandle();
Set<String> windows = driver.getWindowHandles();
for (String window : windows) {
    driver.switchTo().window(window);
    System.out.println(driver.getTitle());
}
driver.switchTo().window(parent);`,
      output: "Each window title can be printed. The driver returns to the parent window.",
    },
    points: [
      "A child window can be moved, minimized, maximized, and closed.",
      "It has an address bar.",
      "getWindowHandle() is one id. getWindowHandles() is the set of ids.",
      "ChildWindow_Popup.java and Window_Handle_Popup.java are the saved programs.",
    ],
    sources: [
      ...pdf("Pop-Up Selenium.pdf, page 4", POP, "child"),
      ...pdf("SELENIUM.pdf, page 3", SEL, "window"),
      javaFile("src/main/java/Selenium/ChildWindow_Popup.java"),
      javaFile("src/main/java/Selenium/Window_Handle_Popup.java"),
    ],
    related: ["se-frames", "se-webdriver-methods"],
  },
  {
    id: "se-ajax",
    group: "se-popups",
    title: "How do you handle an AJAX popup?",
    aliases: ["ajax popup", "stale element retry", "jquery.active"],
    basis: BASIS,
    summary:
      "An AJAX popup appears after an asynchronous update. I wait until it is visible or clickable. If the element is replaced, I find it again.",
    simple: "A stale element means the old reference no longer belongs to the current DOM. The retry finds the element after the update.",
    example: {
      code: `WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
try {
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("ajaxPopup"))).click();
} catch (StaleElementReferenceException ex) {
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("ajaxPopup"))).click();
}`,
      output: "The click runs after the popup is visible. A stale reference is found again. The old WebDriverWait(driver, 10) constructor is corrected to Duration.",
    },
    points: [
      "Wait for visibility or clickability.",
      "Catch StaleElementReferenceException and find the element again.",
      "jQuery.active == 0 only works when the page uses jQuery.",
      "The saved AJAX sample uses WebDriverWait(driver, 10). Selenium 4 wants Duration.ofSeconds(10).",
    ],
    how: "The saved JavaScript check is return jQuery.active == 0. I do not use that check on a page that has no jQuery. A general explicit wait is the safer first answer.",
    sources: pdf("Pop-Up Selenium.pdf, pages 6-7", POP, "ajax"),
    related: ["se-waits", "se-exceptions", "se-dynamic"],
  },
  {
    id: "se-actions",
    group: "se-actions",
    title: "How do you use the Actions class?",
    aliases: ["actions class", "drag and drop", "right click", "mouse hover"],
    basis: BASIS,
    summary: "Actions builds a user gesture. perform() runs it. The saved note shows click, drag and drop, hover, double-click, right-click, and scroll.",
    simple: "I use Actions when the event depends on the mouse. I still use element.click() for an ordinary click.",
    example: {
      code: `Actions actions = new Actions(driver);
actions.moveToElement(element).perform();
actions.contextClick(element).perform();
actions.doubleClick(element).perform();
actions.dragAndDrop(source, target).perform();
actions.scrollToElement(element).perform();`,
      output: "Each perform() runs one gesture. scrollToElement needs a Selenium version that provides it.",
    },
    points: [
      "moveToElement() hovers.",
      "contextClick() is the right-click.",
      "doubleClick() double-clicks.",
      "dragAndDrop() moves from source to target.",
      "click(element) clicks through Actions.",
      "scrollToElement() scrolls the element into view.",
      "WebUtilities.java contains saved Actions usage.",
    ],
    sources: [
      ...pdf("SELENIUM.pdf, page 6", SEL, "actions"),
      javaFile("src/main/java/Selenium/WebUtilities.java"),
    ],
    related: ["se-javascript", "se-webelement"],
  },
  {
    id: "se-select",
    group: "se-actions",
    title: "How do you use the Select class?",
    aliases: ["select class", "dropdown", "selectbyvisibletext"],
    basis: BASIS,
    summary: "Select works with a standard HTML select element. It can choose an option by visible text, value, or index.",
    simple: "I do not use Select for a custom div dropdown. That widget needs a normal click.",
    points: [
      "selectByVisibleText(text).",
      "selectByIndex(index). This index starts at 0.",
      "selectByValue(value).",
      "deselectByVisibleText, deselectByIndex, deselectByValue, and deselectAll work on a multi-select.",
      "getOptions() returns every option.",
      "getAllSelectedOptions() returns the selected options.",
      "getFirstSelectedOption() returns the first selected option.",
      "Print_All_Options.java is a saved program for options.",
    ],
    how: "The saved note says deselect methods are only for multi-select. That is correct. A normal dropdown throws if you deselect an option that cannot be cleared.",
    sources: [
      ...pdf("SELENIUM.pdf, page 5", SEL, "select"),
      javaFile("src/main/java/Selenium/Print_All_Options.java"),
    ],
    related: ["se-webelement", "se-locators"],
  },
  {
    id: "se-excel",
    group: "se-files",
    title: "How do you read Excel and property files?",
    aliases: ["excel", "apache poi", "properties file", "workbookfactory"],
    basis: BASIS,
    summary:
      "The saved note reads Excel with Apache POI. FileInputStream opens the file. WorkbookFactory creates the workbook. A property file uses Properties.load() and getProperty().",
    simple: "The original read method calculates the cell value and does not return it. A corrected method returns the text and closes the streams.",
    example: {
      code: `try (FileInputStream fis = new FileInputStream(filePath);
     Workbook workbook = WorkbookFactory.create(fis)) {
    return workbook.getSheet(sheetName).getRow(rowNo).getCell(columnNo).getStringCellValue();
}
Properties properties = new Properties();
try (FileInputStream input = new FileInputStream(filePath)) {
    properties.load(input);
}
return properties.getProperty(key);`,
      output: "The cell text or the property value is returned. The streams close. Apache POI is not installed in this website, so this was not executed here.",
    },
    points: [
      "FileInputStream reads the file.",
      "FileOutputStream writes the workbook back.",
      "WorkbookFactory.create reads xls or xlsx.",
      "getSheet, getRow, and getCell walk to one cell.",
      "setCellValue writes a cell. write() saves the workbook.",
      "getStringCellValue() throws when the cell is numeric.",
      "The original read method does not close the stream and does not return the value.",
    ],
    how: "DataFormatter is safer when the cell type may be a number. The saved note only shows getStringCellValue(). I mention both.",
    sources: pdf("SELENIUM.pdf, pages 3-4", SEL, "workbook"),
    related: ["se-file-upload", "se-screenshot"],
  },
  {
    id: "se-testng-annotations",
    group: "se-testng",
    title: "What is the TestNG annotation order?",
    aliases: ["testng", "testng annotations", "beforesuite", "dataprovider"],
    basis: BASIS,
    summary:
      "TestNG runs the setup annotations from the suite down to the test method. It runs the teardown annotations in the opposite direction.",
    simple: "BeforeSuite is the outermost setup. AfterSuite is the last teardown. BeforeMethod and AfterMethod wrap every test method.",
    points: [
      "@BeforeSuite runs before the suite.",
      "@BeforeTest runs before the methods in that test tag.",
      "@BeforeClass runs before the first method of the class.",
      "@BeforeMethod runs before each @Test.",
      "@Test marks the test method.",
      "@AfterMethod runs after each @Test.",
      "@AfterClass runs after the methods of the class.",
      "@AfterTest runs after that test tag.",
      "@AfterSuite runs after the suite.",
      "@DataProvider supplies rows of data to a test method.",
    ],
    how: "For one test method the order is BeforeSuite, BeforeTest, BeforeClass, BeforeMethod, Test, AfterMethod, AfterClass, AfterTest, AfterSuite. BeforeMethod and AfterMethod repeat for every test method. A DataProvider calls the test once for each row.",
    sources: pdf("SELENIUM.pdf, page 6", SEL, "beforesuite"),
    related: ["se-testng-controls", "se-assertions", "se-batch-groups"],
  },
  {
    id: "se-testng-controls",
    group: "se-testng",
    title: "How do priority, invocation count, and dependencies work?",
    aliases: ["priority", "invocationcount", "dependsonmethods", "enabled false"],
    basis: BASIS,
    summary:
      "priority sets the order of test methods. invocationCount repeats a method. enabled = false skips a method. dependsOnMethods runs a method only after another method passes.",
    simple: "A lower priority number runs first. The default priority is 0. A circular dependency is invalid because each method would wait for the other.",
    example: {
      code: `@Test(priority = 1)
public void openPage() {}

@Test(priority = 2, dependsOnMethods = "openPage")
public void search() {}

@Test(invocationCount = 3)
public void repeatableCheck() {}

@Test(enabled = false)
public void skippedCheck() {}`,
      output: "openPage runs before search. repeatableCheck runs three times. skippedCheck does not run.",
    },
    points: [
      "priority is a number. Smaller numbers run earlier.",
      "invocationCount repeats one method.",
      "enabled = false disables a method.",
      "dependsOnMethods names the methods that must pass first.",
      "If a dependency fails, the dependent method is skipped.",
      "Two methods that depend on each other form a circular dependency. TestNG rejects that setup.",
    ],
    how: "The saved Selenium and popup PDFs do not show priority, invocationCount, enabled, or dependsOnMethods. They do list the annotations and the idea of running methods together. These attributes are the TestNG follow-up. I verified the behavior against TestNG, not against a line in the PDF.",
    sources: pdf("SELENIUM.pdf, page 6", SEL, "test"),
    related: ["se-testng-annotations", "se-batch-groups"],
  },
  {
    id: "se-assertions",
    group: "se-testng",
    title: "What is the difference between Assert and SoftAssert?",
    aliases: ["softassert", "hard assert", "assertall", "assertequals"],
    basis: BASIS,
    summary:
      "A hard assert stops the current test method when the check fails. A soft assert records the failure and continues. assertAll() reports the recorded soft failures.",
    simple: "I use a hard assert when the next step depends on this result. I use a soft assert when I want to collect several checks.",
    points: [
      "Assert methods are static.",
      "SoftAssert methods are instance methods.",
      "The saved names are assertEquals, assertNotEquals, assertSame, assertNotSame, assertNull, assertNotNull, assertTrue, assertFalse, and fail.",
      "The note spells one method assetEquals. The TestNG method is assertEquals.",
      "The note says a hard assert does not call AssertAll. That spelling in TestNG is assertAll, and it belongs to SoftAssert.",
      "If I forget assertAll(), a soft assert can fail quietly and the test still passes.",
    ],
    how: "An if-else does not fail a TestNG test by itself. The saved note makes that point. fail() is the explicit failure. I call soft.assertAll() at the end of the method.",
    sources: pdf("SELENIUM.pdf, page 7", SEL, "assert"),
    related: ["se-testng-annotations"],
  },
  {
    id: "se-batch-groups",
    group: "se-testng",
    title: "What is batch execution and group execution?",
    aliases: ["batch execution", "group execution", "testng.xml", "groups"],
    basis: BASIS,
    summary:
      "Batch execution runs several classes or methods in one testng.xml run. Group execution runs the methods that belong to a named group.",
    simple: "I put the classes in testng.xml for a batch. I add groups on @Test when I want to run only smoke tests or only regression tests.",
    example: {
      code: `@Test(groups = "smoke")
public void login() {}

// testng.xml
// <suite name="Batch">
//   <test name="Smoke">
//     <groups><run><include name="smoke"/></run></groups>
//     <classes><class name="LoginTest"/></classes>
//   </test>
// </suite>`,
      output: "The suite runs the included group. Methods outside that group stay out of this run.",
    },
    points: [
      "A batch can run sequentially or in parallel.",
      "testng.xml defines the batch.",
      "groups on @Test labels a method.",
      "include and exclude choose the groups for a run.",
    ],
    sources: pdf("SELENIUM.pdf, page 8", SEL, "batch"),
    related: ["se-testng-annotations", "se-parallel"],
  },
  {
    id: "se-parallel",
    group: "se-parallel",
    title: "How do you run Selenium tests in parallel?",
    aliases: ["parallel execution", "parallel tests", "thread-count"],
    basis: BASIS,
    summary:
      "TestNG can run separate tests at the same time. parallel=\"tests\" and thread-count=\"3\" run the Chrome, Firefox, and Edge tests together.",
    simple: "Each test creates its own driver. I do not share one driver field across threads. Each test quits its own driver.",
    example: {
      code: `@Parameters("browser")
@Test
public void testInMultipleBrowsers(String browser) {
    WebDriver driver = null;
    try {
        if (browser.equalsIgnoreCase("chrome")) driver = new ChromeDriver();
        else if (browser.equalsIgnoreCase("firefox")) driver = new FirefoxDriver();
        else if (browser.equalsIgnoreCase("edge")) driver = new EdgeDriver();
        driver.get("http://yourtestsite.com");
    } finally {
        if (driver != null) driver.quit();
    }
}`,
      output: "Three tests can run together. Each browser closes in finally. The saved XML uses parallel=\"tests\" and thread-count=\"3\".",
    },
    points: [
      "The note creates ChromeDriver, FirefoxDriver, or EdgeDriver from a browser parameter.",
      "Each browser has its own test tag and parameter in testng.xml.",
      "thread-count is the number of concurrent threads.",
      "The original snippet stores driver in a field. A shared field can be overwritten by another thread.",
      "The corrected method keeps the driver local.",
    ],
    how: "The saved suite is named Parallel Browser Suite. It has Chrome Test, Firefox Test, and Edge Test. The class name in the note is ParallelTest. Quit belongs in finally so a failed get() still closes the browser.",
    questions: [
      {
        prompt: "Why should parallel tests not share one mutable WebDriver?",
        short: "One driver field can be replaced by another thread. Clicks and quits then hit the wrong browser. Each test needs its own driver.",
        detail: "ThreadLocal is one way to store that driver per thread. The ThreadLocal lesson shows the pattern.",
      },
      {
        prompt: "How would you execute tests across Chrome, Firefox, and Edge?",
        short: "I pass the browser name into the test and create only that driver. TestNG can run the three browser tests at the same time.",
        detail: "The saved note uses parallel=\"tests\" and thread-count=\"3\". Each test quits its own driver.",
      },
      {
        prompt: "When should parallel execution be limited?",
        short: "I limit it when tests share data, the environment is small, or failures become impossible to read. More threads are not useful when the bottleneck is the application or the network.",
        detail: "I raise the thread count only after a smaller run is stable.",
      },
      {
        prompt: "How do you decide the thread count?",
        short: "I start from the number of independent tests and the capacity of the agents. I stop increasing threads when the suite gets slower or flakier.",
        detail: "thread-count=\"3\" in the saved note matches three browsers. It is not a universal number.",
      },
    ],
    sources: pdf("Pop-Up Selenium.pdf, pages 4-5", POP, "parallel"),
    related: ["se-grid", "se-batch-groups", "se-webdriver", "se-thread-local"],
  },
  {
    id: "se-grid",
    group: "se-parallel",
    title: "What is Selenium Grid?",
    aliases: ["selenium grid", "hub and node", "cross browser grid"],
    basis: BASIS,
    summary:
      "Selenium Grid runs WebDriver sessions on more than one machine. A router or hub receives the test. A node runs the requested browser.",
    simple: "I use Grid when the same test must run on another browser or operating system. The test still needs its own remote driver.",
    points: [
      "The saved advantage list names Selenium Grid for parallel execution.",
      "The popup note shows local Chrome, Firefox, and Edge. It does not show a Grid URL.",
      "A node advertises the browsers it can start.",
      "The test asks for a browser and a platform through capabilities.",
      "Grid does not remove the need for isolated drivers.",
      "Robot and OS dialogs are unreliable on a remote node.",
    ],
    how: "The saved PDFs do not describe a hub command, a node command, or a sample RemoteWebDriver URL. I keep Grid as the named topic and I do not invent a command that is not in the notes.",
    sources: pdf("SELENIUM.pdf, page 1", SEL, "grid"),
    related: ["se-parallel", "se-advantages"],
  },
  {
    id: "se-exceptions",
    group: "se-exceptions",
    title: "Which Selenium exceptions should I explain?",
    aliases: ["nosuchelementexception", "staleelementreferenceexception", "stale element", "elementnotvisibleexception", "elementnotinteractableexception", "timeout exception", "webdriverexception"],
    basis: BASIS,
    summary: "These exceptions say what failed in the browser. I name the cause and the usual fix. I do not only catch and hide them.",
    simple: "A missing element, a covered element, a stale reference, and a timeout are the four I meet most often.",
    points: [
      "NoSuchElementException: the locator matched nothing. I check the locator and the wait.",
      "ElementNotVisibleException: the saved note says the element is in the DOM but not visible. Selenium 4 more often throws ElementNotInteractableException for an element that cannot be used.",
      "ElementNotInteractableException: the element is present but the user cannot type or click. I wait until it is ready, or I scroll it into view.",
      "ElementClickInterceptedException: another element covers the click. I close the overlay or scroll.",
      "TimeoutException: the wait or the driver command ran out of time. I check the condition and the timeout.",
      "StaleElementReferenceException: the page replaced the element. I find it again.",
      "WebDriverException: a general driver failure, such as a closed browser.",
      "InvalidArgumentException: the method received a bad argument, such as a malformed URL or capability.",
    ],
    how: "The saved note keeps ElementNotVisibleException. I preserve that name. In Selenium 4 I also explain ElementNotInteractableException, because that is the exception current tests usually see.",
    questions: [
      {
        prompt: "How do you handle StaleElementReferenceException?",
        short: "The page replaced the element I was holding. I find it again after the update, and I wait until the new element is ready.",
        detail: "I do not keep clicking the old reference. The AJAX lesson shows one retry. A retry loop is not a fix for a bad locator.",
      },
      {
        prompt: "How do you investigate TimeoutException?",
        short: "I check which condition timed out, then I look at the screenshot and the locator. The element may be absent, hidden, or slower than the timeout.",
        detail: "I do not raise every timeout to several minutes. I fix the condition or the application delay.",
      },
    ],
    sources: pdf("SELENIUM.pdf, page 7", SEL, "nosuchelementexception"),
    related: ["se-waits", "se-find-element", "se-ajax", "se-ci-failure"],
  },
  {
    id: "se-dynamic",
    group: "se-pages",
    title: "How do you handle dynamic elements?",
    aliases: ["dynamic elements", "partial attribute", "dynamic xpath"],
    basis: BASIS,
    summary:
      "A dynamic element changes its id or appears late. I wait for a condition. I locate it with a stable partial attribute instead of the whole generated id.",
    simple: "contains(@id,'user') survives an id such as user-102. An explicit wait survives the delay.",
    points: [
      "Wait until the element is present, visible, or clickable.",
      "Use a partial CSS or XPath attribute.",
      "findElements() can confirm that a changing list is empty or not.",
      "Find the element again after an AJAX refresh.",
      "The saved note names this maintenance cost as a Selenium disadvantage too.",
    ],
    questions: [
      {
        prompt: "How do you debug failures caused by dynamic elements?",
        short: "I compare the locator with the element that was actually on the page. I check whether the id changed, the element arrived late, or a stale reference was reused.",
        detail: "The screenshot and the page source at the failure show which of those three happened.",
      },
    ],
    sources: pdf("SELENIUM.pdf, page 8", SEL, "dynamic"),
    related: ["se-xpath", "se-waits", "se-page-factory", "se-ci-failure"],
  },
  {
    id: "se-page-factory",
    group: "se-pages",
    title: "What is Page Factory?",
    aliases: ["page factory", "findby", "page object model"],
    basis: BASIS,
    summary:
      "Page Factory initializes elements that a page class declares with @FindBy. The page class keeps the locators and actions in one place.",
    simple: "A Page Object is the class that represents one page. Page Factory is one way to create the elements inside that class. I can also call driver.findElement inside the page class without Page Factory.",
    example: {
      code: `public class LoginPage {
    @FindBy(id = "user")
    private WebElement user;

    public LoginPage(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }
}`,
      output: "initElements assigns the user field from the @FindBy locator. The field is found when the test uses it.",
    },
    points: [
      "@FindBy holds the locator.",
      "PageFactory.initElements connects the fields to the driver.",
      "The page class makes the test read like a user action.",
      "A changed locator is updated in the page class, not in every test.",
      "Page Factory does not remove waits. A dynamic element still needs a condition.",
      "The saved note says Page Factory improves readability and maintenance.",
    ],
    how: "Page Factory lookup is lazy in current Selenium. The element is searched when the field is used. If the DOM changes, the same stale-element rule still applies.",
    questions: [
      {
        prompt: "Why do we use the Page Object Model?",
        short: "A page class holds the locators and the actions for one page. The test then reads like a user flow. A locator change stays in that class.",
        detail: "The test should not repeat By.id calls. It should call a method such as loginPage.signIn().",
      },
      {
        prompt: "What is the difference between Page Object Model and Page Factory?",
        short: "Page Object Model is the design. Page Factory is one Selenium helper that fills @FindBy fields. A page class can call findElement directly and still be a page object.",
        detail: "Page Factory does not add waits, reporting, or a driver. The framework lesson describes where those pieces belong.",
      },
    ],
    sources: pdf("SELENIUM.pdf, page 8", SEL, "page factory"),
    related: ["se-dynamic", "se-locators", "se-framework"],
  },
  {
    id: "se-programs",
    group: "se-popups",
    title: "Saved Selenium programs",
    aliases: ["selenium programs", "popup programs"],
    basis: BASIS,
    summary: "These Java files are the saved Selenium programs. Open one in Source mode to read the original file.",
    simple: "The lessons explain the ideas. These buttons open the original programs.",
    points: PROGRAMS.map((path) => `${path.split("/").pop()} is saved. Open it in Source mode.`),
    sources: PROGRAMS.map((path) => javaFile(path)),
    related: ["se-alerts", "se-popup-kinds"],
  },
  ...ADVANCED,
];

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function seleniumById(id: string): ConceptLesson | undefined {
  return SELENIUM_CONCEPTS.find((lesson) => lesson.id === id);
}

export function seleniumInGroup(group: ConceptGroupId): ConceptLesson[] {
  return SELENIUM_CONCEPTS.filter((lesson) => lesson.group === group);
}

export function searchSeleniumLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return SELENIUM_CONCEPTS.map((lesson) => {
    const names = [lesson.title, ...lesson.aliases].map(plain).filter(Boolean);
    let score = 0;
    if (names.some((name) => name === asked)) score = 200;
    else if (names.some((name) => asked.includes(name))) score = 160;
    else {
      const tokens = asked.split(" ").filter((token) => token.length > 2);
      const blob = names.join(" ");
      const matched = tokens.filter((token) => blob.includes(token));
      if (tokens.length > 0 && matched.length === tokens.length) score = 70 + matched.length;
    }
    return { id: lesson.id, title: lesson.title, group: lesson.group, score };
  })
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}
