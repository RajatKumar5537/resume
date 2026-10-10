import type { ConceptLesson } from "./concepts";

const BASIS =
  "Prepared interview explanation. It is not a quotation from a saved PDF or Java file.";

function sides(
  title: string,
  rows: [string, string, string, string][],
): NonNullable<ConceptLesson["compare"]> {
  const mapped = rows.map(([leftLabel, left, rightLabel, right]) => ({
    leftLabel,
    left,
    rightLabel,
    right,
  }));
  return {
    title,
    leftLabel: mapped[0].leftLabel,
    left: mapped[0].left,
    rightLabel: mapped[0].rightLabel,
    right: mapped[0].right,
    rows: mapped,
  };
}

export const BATCH2: ConceptLesson[] = [
  {
    id: "string-basics",
    group: "strings",
    title: "What is a String in Java?",
    aliases: ["string immutability", "immutable string", "what is a string"],
    basis: BASIS,
    summary:
      "A String is an object that holds a sequence of characters. A String is immutable. Its content cannot be changed after it is created.",
    simple:
      "A modifying method returns another String. It does not change the original object's content. The first concat() result is not assigned, so name still prints Java. Assigning that result changes the variable to Java Selenium.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String name = "Java";
        name.concat(" Selenium");
        System.out.println(name);

        name = name.concat(" Selenium");
        System.out.println(name);
    }
}`,
      output: "Java\nJava Selenium",
    },
    points: [
      "String content cannot be changed after the object is created.",
      "A method such as concat() returns another String.",
      "The original variable changes only when you assign that result.",
    ],
    questions: [
      {
        prompt: "Why is String immutable?",
        short: "Immutability keeps a String value stable. Java can share that value safely, including through the String pool. A shared String is also simpler to use across threads because its content does not change.",
        detail: "Shared String objects stay stable because their content is not modified in place.",
      },
    ],
    gap: "The saved library files linked elsewhere do not include a String-immutability note. This answer is prepared.",
    sources: [],
    related: ["string-pool", "string-equals", "string-builder-buffer"],
  },
  {
    id: "string-pool",
    group: "strings",
    title: "What is the String pool?",
    aliases: ["string pool", "string constant pool", "intern"],
    basis: BASIS,
    summary:
      "The String pool is an area in the JVM heap. Java keeps canonical String instances there. Literals with the same content can share one pooled instance.",
    simple:
      "In this example, both literals refer to the same pooled String. So == prints true. new String(\"Java\") creates a separate object. == against the literal then prints false. equals() still prints true.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String a = "Java";
        String b = "Java";
        System.out.println(a == b);

        String created = new String("Java");
        System.out.println(a == created);
        System.out.println(a.equals(created));
    }
}`,
      output: "true\nfalse\ntrue",
    },
    points: [
      "String literals with the same content can share one pooled instance.",
      "new String(\"Java\") creates a distinct object.",
      "== compares references.",
      "equals() compares String content.",
    ],
    questions: [
      {
        prompt: "What happens with new String(\"Java\")?",
        short: "new String(\"Java\") creates a new String object. Comparing that object with a literal using == normally returns false.",
        detail: "equals() still returns true when the character sequences match.",
      },
    ],
    gap: "No saved source file in the lesson library explains the String pool. This answer is prepared.",
    sources: [],
    related: ["string-basics", "string-equals", "equals-operator"],
  },
  {
    id: "string-equals",
    group: "strings",
    title: "What is the difference between == and equals() for Strings?",
    aliases: ["string equals", "equals for strings", "== for strings"],
    basis: BASIS,
    summary:
      "For String objects, == checks whether both references point to the same object. equals() checks whether the character sequences are equal.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String first = new String("Hello");
        String second = new String("Hello");

        System.out.println(first == second);
        System.out.println(first.equals(second));
    }
}`,
      output: "false\ntrue",
    },
    points: [
      "The two new String(\"Hello\") objects have the same text.",
      "They are still different objects.",
      "Use equals() to compare String content.",
      "Use == only when you mean to compare object identity.",
    ],
    questions: [
      {
        prompt: "Which should we use to compare String values?",
        short: "Use equals() to compare String content. Use == only when you mean to compare object identity.",
        detail: "first == second is false here. first.equals(second) is true.",
      },
    ],
    sources: [{ label: "Array and collection notes, equals", path: "Interview_PDF/Array_Collection_Java.pdf", kind: "pdf", focus: "equals" }],
    how: "The saved collection note discusses == and equals(). The String examples on this page are prepared. They are not copied from that file.",
    related: ["string-pool", "equals-operator", "string-basics"],
  },
  {
    id: "string-char-array",
    group: "strings",
    title: "How do you convert a String into a character array?",
    aliases: ["tochararray", "character array", "string to char array"],
    basis: BASIS,
    summary: "Use the toCharArray() method to convert a String into a char[].",
    simple: "The follow-up conversion uses the String constructor that copies a char[].",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String text = "Java";
        char[] characters = text.toCharArray();
        System.out.println(characters[0]);
        System.out.println(characters.length);

        char[] letters = {'J', 'a', 'v', 'a'};
        String rebuilt = new String(letters);
        System.out.println(rebuilt);
    }
}`,
      output: "J\n4\nJava",
    },
    points: [
      "toCharArray() returns a char[] copy of the String.",
      "new String(characters) builds a String from a character array.",
      "The saved note also builds a String by appending each character in a loop.",
    ],
    questions: [
      {
        prompt: "How do you convert a character array into a String?",
        short: "Use the String constructor: new String(characters).",
        detail: "char[] letters = {'J', 'a', 'v', 'a'} becomes the String Java.",
      },
    ],
    gap: "No saved source file in the lesson library demonstrates toCharArray(). This answer is prepared.",
    sources: [],
    related: ["string-basics", "string-charat", "string-constructors"],
  },
  {
    id: "string-charat",
    group: "strings",
    title: "What is charAt()?",
    aliases: ["charat", "char at", "character at index"],
    basis: BASIS,
    summary:
      "charAt(index) returns the UTF-16 code unit at that index. Indexes start at zero. An invalid index throws StringIndexOutOfBoundsException.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String text = "Java";
        System.out.println(text.charAt(0));
        System.out.println(text.charAt(3));
    }
}`,
      output: "J\na",
    },
    points: ["The first character is at index 0.", "The last character is at index text.length() - 1.", "An invalid index causes StringIndexOutOfBoundsException."],
    questions: [
      {
        prompt: "Is charAt() zero-based?",
        short: "Yes. The first character is at index 0. The last character is at index text.length() - 1.",
        detail: "text.charAt(0) is J and text.charAt(3) is a for the String Java.",
      },
    ],
    gap: "No saved source file in the lesson library demonstrates charAt(). This answer is prepared.",
    sources: [],
    related: ["string-char-array", "string-basics"],
  },
  {
    id: "string-builder-buffer",
    group: "strings",
    title: "What is the difference between String, StringBuilder, and StringBuffer?",
    aliases: ["string vs stringbuilder", "stringbuilder vs stringbuffer", "string vs stringbuilder vs stringbuffer"],
    basis: BASIS,
    summary:
      "String is immutable. StringBuilder is mutable and is the usual choice for repeated edits in one thread. StringBuffer is mutable, and its methods are synchronized.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder("Java");
        builder.append(" Selenium");
        System.out.println(builder);
    }
}`,
      output: "Java Selenium",
    },
    points: ["StringBuilder is the usual choice for building text in one thread.", "StringBuffer methods are synchronized."],
    table: {
      title: "String, StringBuilder, and StringBuffer",
      headers: ["Feature", "String", "StringBuilder", "StringBuffer"],
      rows: [
        ["Mutable", "No", "Yes", "Yes"],
        ["Repeated modifications", "May create additional String objects", "Efficient for many single-threaded modifications", "Useful when synchronized mutable String operations are required"],
        ["Synchronization", "Not needed for immutable content", "Not synchronized", "Synchronized methods"],
        ["Typical use", "Fixed text values", "Building text in loops", "Shared mutable text with synchronization requirements"],
      ],
    },
    questions: [
      {
        prompt: "Why is StringBuilder commonly preferred in loops?",
        short: "StringBuilder changes one mutable buffer. A String concatenation can create a new String on every pass through the loop.",
        detail: "String concatenation in a loop can create additional String objects. StringBuilder appends into its buffer.",
      },
    ],
    gap: "No saved source file in the lesson library compares String, StringBuilder, and StringBuffer. This answer is prepared.",
    sources: [],
    related: ["string-basics", "string-builder", "string-buffer"],
  },
  {
    id: "string-builder",
    group: "strings",
    title: "What is StringBuilder?",
    aliases: ["stringbuilder", "string builder"],
    basis: BASIS,
    summary:
      "StringBuilder is a mutable sequence of characters. append, insert, delete, replace, and reverse change that same buffer.",
    simple:
      "append makes Java Code. insert makes Learn Java Code. replace(0, 5, \"Study\") makes Study Java Code. reverse then prints edoC avaJ ydutS.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder("Java");

        builder.append(" Code");
        builder.insert(0, "Learn ");
        builder.replace(0, 5, "Study");
        builder.reverse();

        System.out.println(builder);
    }
}`,
      output: "edoC avaJ ydutS",
    },
    points: [
      "append() adds content at the end.",
      "insert() inserts content at an index.",
      "replace() replaces a range.",
      "delete() removes a range.",
      "reverse() reverses the sequence.",
      "length() returns the current character count.",
      "capacity() returns the current buffer capacity.",
    ],
    how: "replace(0, 5, \"Study\") replaces the five characters in Learn. The space after Learn stays. The reversed text is edoC avaJ ydutS. There is a space between avaJ and ydutS.",
    gap: "No saved source file in the lesson library is a StringBuilder tutorial. This answer is prepared.",
    sources: [],
    related: ["string-builder-buffer", "string-builder-capacity", "string-buffer"],
  },
  {
    id: "string-builder-capacity",
    group: "strings",
    title: "What are the capacity and length of StringBuilder?",
    aliases: ["stringbuilder capacity", "stringbuilder length", "builder capacity"],
    basis: BASIS,
    summary:
      "Length is how many characters are stored now. Capacity is how much storage the buffer has before it must grow.",
    simple:
      "Different constructors start with different capacities. StringBuilder(String) starts at the String length plus 16.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        StringBuilder builder = new StringBuilder("Java");
        System.out.println(builder.length());
        System.out.println(builder.capacity());
    }
}`,
      output: "4\n20",
    },
    points: ["length() is the current character count.", "capacity() is the current buffer size.", "When the content no longer fits, the builder increases its capacity automatically."],
    questions: [
      {
        prompt: "What happens when capacity is exceeded?",
        short: "The builder increases its capacity automatically.",
        detail: "Length is how many characters are stored. Capacity is how many the buffer can hold before it grows.",
      },
    ],
    gap: "No saved source file in the lesson library explains StringBuilder capacity. This answer is prepared.",
    sources: [],
    related: ["string-builder", "string-builder-buffer"],
  },
  {
    id: "string-buffer",
    group: "strings",
    title: "What is StringBuffer?",
    aliases: ["stringbuffer", "string buffer"],
    basis: BASIS,
    summary:
      "StringBuffer is a mutable character sequence, like StringBuilder. Its methods are synchronized. Use it when a shared buffer needs those synchronized operations.",
    points: [
      "StringBuffer methods are synchronized.",
      "Synchronized methods do not make a whole series of calls atomic by themselves.",
      "Choose the class based on the actual thread-safety requirements.",
    ],
    gap: "No saved source file in the lesson library explains StringBuffer. This answer is prepared.",
    sources: [],
    related: ["string-builder", "string-builder-buffer"],
  },
  {
    id: "wrapper-classes",
    group: "wrappers",
    title: "What are wrapper classes in Java?",
    aliases: ["wrapper classes", "wrapper class", "integer wrapper"],
    basis: BASIS,
    summary:
      "Wrapper classes represent primitive values as objects. Integer wraps an int. Double wraps a double. Boolean wraps a boolean.",
    simple:
      "Collections such as ArrayList store objects, not primitive values. A wrapper lets a primitive value live in a collection.",
    example: {
      code: `import java.util.ArrayList;
import java.util.List;

class Main {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>();
        numbers.add(10);
        numbers.add(20);
        System.out.println(numbers);
    }
}`,
      output: "[10, 20]",
    },
    points: ["A wrapper class represents one primitive type as an object.", "ArrayList<Integer> can store int values because they are boxed into Integer objects."],
    table: {
      title: "Primitive types and wrapper classes",
      headers: ["Primitive", "Wrapper"],
      rows: [
        ["byte", "Byte"],
        ["short", "Short"],
        ["int", "Integer"],
        ["long", "Long"],
        ["float", "Float"],
        ["double", "Double"],
        ["char", "Character"],
        ["boolean", "Boolean"],
      ],
    },
    how: "The ArrayList example is prepared. The saved collection note explains ArrayList, not this wrapper table.",
    sources: [{ label: "Array and collection notes, ArrayList", path: "Interview_PDF/Array_Collection_Java.pdf", kind: "pdf", focus: "arraylist" }],
    related: ["autoboxing", "primitive-reference", "list-arraylist"],
  },
  {
    id: "autoboxing",
    group: "wrappers",
    title: "What is autoboxing and unboxing?",
    aliases: ["autoboxing", "unboxing", "auto unboxing"],
    basis: BASIS,
    summary:
      "Autoboxing converts a primitive value to its wrapper object automatically. Unboxing converts a wrapper object back to its primitive value automatically.",
    simple:
      "Unboxing a null wrapper throws NullPointerException. Wrapper objects are immutable. Avoid extra boxing and unboxing in a performance-sensitive loop.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int number = 10;
        Integer wrapped = number;
        int result = wrapped;
        System.out.println(result);

        Integer empty = null;
        System.out.println(empty == null);
    }
}`,
      output: "10\ntrue",
    },
    points: [
      "Assigning an int to Integer is autoboxing.",
      "Assigning an Integer to int is unboxing.",
      "Unboxing null throws NullPointerException.",
      "Wrapper objects are immutable.",
    ],
    questions: [
      {
        prompt: "Can unboxing fail?",
        short: "Yes. Unboxing a null wrapper reference causes NullPointerException.",
        detail: "Integer number = null, then int value = number, throws NullPointerException. The example prints 10. It then checks that a separate reference is null. It does not unbox that null reference.",
      },
    ],
    gap: "No saved source file in the lesson library explains autoboxing. This answer is prepared.",
    sources: [],
    related: ["wrapper-classes", "primitive-reference"],
  },
  {
    id: "primitive-reference",
    group: "wrappers",
    title: "What is the difference between primitive and reference types?",
    aliases: ["primitive vs reference", "reference type", "primitive type"],
    basis: BASIS,
    summary:
      "A primitive variable holds a value such as a number or a boolean. A reference variable holds a reference to an object, or it can be null.",
    simple: "count is primitive. name and score are reference variables.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int count = 5;
        String name = "Rajat";
        Integer score = 95;

        System.out.println(count);
        System.out.println(name);
        System.out.println(score);
    }
}`,
      output: "5\nRajat\n95",
    },
    points: [
      "Primitive types include byte, short, int, long, float, double, char, and boolean.",
      "Classes, arrays, and interfaces are reference types.",
      "Instance fields receive default values when not explicitly initialized.",
      "Local variables must be definitely assigned before use.",
    ],
    gap: "No saved source file in the lesson library explains primitive and reference types. This answer is prepared.",
    sources: [],
    related: ["wrapper-classes", "classes-objects", "autoboxing"],
  },
  {
    id: "exception-basics",
    group: "exceptions",
    title: "What is an exception in Java?",
    aliases: ["exception", "what is an exception"],
    basis: BASIS,
    summary:
      "An exception is an object that interrupts the normal flow of a program. Java lets you handle the failures that can be recovered from.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero");
        }
    }
}`,
      output: "Cannot divide by zero",
    },
    points: ["The catch block handles the ArithmeticException from integer division by zero.", "The println inside try does not run."],
    gap: "No saved exception note is linked for this lesson. This answer is prepared.",
    sources: [],
    related: ["exception-hierarchy", "try-catch-finally", "checked-unchecked"],
  },
  {
    id: "exception-hierarchy",
    group: "exceptions",
    title: "What is the exception hierarchy?",
    aliases: ["exception hierarchy", "throwable", "checked and unchecked hierarchy"],
    basis: BASIS,
    summary:
      "Throwable is the root of everything that can be thrown. Its two main branches are Error and Exception.",
    simple:
      "Error usually means a serious JVM or system problem. An application normally should not try to recover from an Error. Exception means a condition the application may handle. RuntimeException and its subclasses are unchecked. Other exception types that the compiler requires you to catch or declare are checked.",
    points: [
      "ArithmeticException: arithmetic operation failure, such as integer division by zero.",
      "NullPointerException: attempting an invalid operation through a null reference.",
      "ArrayIndexOutOfBoundsException: invalid array index.",
      "IOException: input/output failure.",
      "SQLException: database access failure.",
    ],
    gap: "No saved exception-hierarchy note is linked for this lesson. This answer is prepared.",
    sources: [],
    related: ["exception-basics", "checked-unchecked", "compile-vs-runtime"],
  },
  {
    id: "checked-unchecked",
    group: "exceptions",
    title: "What is the difference between checked and unchecked exceptions?",
    aliases: ["checked exception", "unchecked exception", "checked vs unchecked"],
    basis: BASIS,
    summary:
      "Checked exceptions are checked by the compiler. You must catch them or declare them. Unchecked exceptions extend RuntimeException. The compiler does not force that catch-or-declare rule on them.",
    points: [
      "Error is not a checked exception.",
      "Error is a separate branch under Throwable.",
      "Error is not a subclass of Exception.",
    ],
    compare: sides("Checked and unchecked exceptions", [
      ["Checked exception", "Compiler requires handling or declaration.", "Unchecked exception", "No mandatory catch-or-declare requirement."],
      ["Checked exception", "Often represents an anticipated external failure.", "Unchecked exception", "Often indicates invalid state, invalid arguments, or programming errors."],
      ["Checked exception", "Example: IOException", "Unchecked exception", "Example: NullPointerException"],
    ]),
    questions: [
      {
        prompt: "Is Error a checked exception?",
        short: "No. Error is a separate branch under Throwable. It is not a subclass of Exception.",
        detail: "Checked and unchecked refer to Exception types. Error is the other branch of Throwable.",
      },
    ],
    gap: "No saved source file in the lesson library explains checked and unchecked exceptions. This answer is prepared.",
    sources: [],
    related: ["exception-hierarchy", "throw-throws", "exception-basics"],
  },
  {
    id: "throw-throws",
    group: "exceptions",
    title: "What is the difference between throw and throws?",
    aliases: ["throw vs throws", "throw and throws"],
    basis: BASIS,
    summary:
      "throw actually throws an exception object. throws appears in a method signature and lists exceptions the method may pass on.",
    simple:
      "throw creates the exception at that moment. throws only declares that a method may pass an exception on. readFile() declares IOException. This run does not call readFile(). validateAge(16) throws, and the catch block prints the message.",
    example: {
      code: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

class Main {
    static void validateAge(int age) {
        if (age < 18) {
            throw new IllegalArgumentException("Age must be 18 or above");
        }
    }

    static String readFile() throws IOException {
        return Files.readString(Path.of("notes.txt"));
    }

    public static void main(String[] args) {
        try {
            validateAge(16);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
      output: "Age must be 18 or above",
    },
    points: ["throw actually throws an exception.", "throws declares possible exceptions in the method signature."],
    gap: "No saved source file in the lesson library explains throw and throws. This answer is prepared.",
    sources: [],
    related: ["checked-unchecked", "custom-exception", "exception-basics"],
  },
  {
    id: "try-catch-finally",
    group: "exceptions",
    title: "What are try, catch, and finally?",
    aliases: ["try catch finally", "finally block", "try catch"],
    basis: BASIS,
    summary:
      "try holds the code that may throw. catch handles a matching exception. finally holds cleanup that should run as control leaves the try statement in normal flows.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 2;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic error");
        } finally {
            System.out.println("Finished");
        }
    }
}`,
      output: "5\nFinished",
    },
    points: ["This division succeeds, so the catch block does not run.", "finally still prints Finished.", "finally is not guaranteed to execute if the JVM or process terminates abruptly."],
    gap: "No saved source file in the lesson library explains try, catch, and finally. This answer is prepared.",
    sources: [],
    related: ["exception-basics", "multiple-catch", "try-with-resources", "final-finally-finalize"],
  },
  {
    id: "multiple-catch",
    group: "exceptions",
    title: "Can we have multiple catch blocks?",
    aliases: ["multiple catch", "multi catch", "catch order"],
    basis: BASIS,
    summary:
      "Yes. Use a separate catch block for each exception type you want to handle. Put the more specific type before the more general type.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        try {
            int[] numbers = {10, 20};
            System.out.println(numbers[5]);
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic error");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Invalid array index");
        }
    }
}`,
      output: "Invalid array index",
    },
    points: [
      "numbers[5] throws ArrayIndexOutOfBoundsException.",
      "A superclass catch cannot come before a subclass catch. The subclass catch would be unreachable.",
    ],
    gap: "No saved source file in the lesson library explains multiple catch blocks. This answer is prepared.",
    sources: [],
    related: ["try-catch-finally", "exception-hierarchy"],
  },
  {
    id: "custom-exception",
    group: "exceptions",
    title: "What is a custom exception?",
    aliases: ["custom exception", "user defined exception"],
    basis: BASIS,
    summary:
      "A custom exception is an exception class for one application-specific failure. The name tells the caller what went wrong.",
    simple:
      "Extend Exception for a checked custom exception. Extend RuntimeException for an unchecked custom exception. The example calls validateAge(16) so the message is printed.",
    example: {
      code: `class InvalidAgeException extends RuntimeException {
    InvalidAgeException(String message) {
        super(message);
    }
}

class Main {
    static void validateAge(int age) {
        if (age < 18) {
            throw new InvalidAgeException("Age is below 18");
        }
    }

    public static void main(String[] args) {
        try {
            validateAge(16);
        } catch (InvalidAgeException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
      output: "Age is below 18",
    },
    points: [
      "InvalidAgeException extends RuntimeException, so it is unchecked.",
      "Extend Exception for a checked custom exception.",
    ],
    gap: "No saved source file in the lesson library defines a custom exception. This answer is prepared.",
    sources: [],
    related: ["throw-throws", "checked-unchecked"],
  },
  {
    id: "try-with-resources",
    group: "exceptions",
    title: "What is try-with-resources?",
    aliases: ["try with resources", "autocloseable", "try-with-resources"],
    basis: BASIS,
    summary:
      "Try-with-resources closes resources that implement AutoCloseable. It closes them when the try statement finishes. That includes the case where an exception is thrown.",
    simple:
      "The example writes notes.txt first so a line can be printed. The important part is the try-with-resources statement. It reads the first line. It then closes the reader.",
    example: {
      code: `import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;

class Main {
    public static void main(String[] args) throws Exception {
        Path path = Path.of("notes.txt");
        Files.writeString(path, "Java concepts\\n");

        try (BufferedReader reader = Files.newBufferedReader(path)) {
            System.out.println(reader.readLine());
        }
    }
}`,
      output: "Java concepts",
    },
    points: [
      "The resource is closed when the try statement finishes.",
      "It is also closed when an exception is thrown.",
      "Try-with-resources reduces cleanup boilerplate and helps prevent resource leaks.",
    ],
    questions: [
      {
        prompt: "Why use try-with-resources?",
        short: "It reduces cleanup boilerplate and helps prevent resource leaks.",
        detail: "Resources declared in the try parentheses must implement AutoCloseable.",
      },
    ],
    gap: "No saved source file in the lesson library explains try-with-resources. This answer is prepared.",
    sources: [],
    related: ["try-catch-finally", "final-finally-finalize"],
  },
  {
    id: "final-finally-finalize",
    group: "exceptions",
    title: "What is the difference between final, finally, and finalize()?",
    aliases: ["finally vs final", "finalize", "final finally finalize"],
    basis: BASIS,
    summary:
      "final restricts reassignment, overriding, or inheritance. finally is a cleanup block in exception handling. finalize() is a deprecated cleanup method. Do not use finalize() to manage resources.",
    simple:
      "Use try-with-resources or an explicit close method for resources. Do not wait for garbage collection to release an important resource. Do not use finalize() for that job.",
    points: [
      "final restricts reassignment, overriding, or inheritance.",
      "finally is an exception-handling construct.",
      "finalize() is deprecated and is not the way to manage resources.",
    ],
    how: "The saved OOPS note discusses static and final. This lesson does not take the finally and finalize() distinction from that note. That distinction is prepared.",
    sources: [{ label: "OOPS notes, final", path: "Interview_PDF/OOPS concept_Java.pdf", kind: "pdf", focus: "final" }],
    related: ["static-final", "try-catch-finally", "try-with-resources"],
  },
  {
    id: "jdk-jre-jvm",
    group: "execution",
    title: "What are JDK, JRE, and JVM?",
    aliases: ["jdk jre jvm", "what is jvm", "what is jdk", "what is jre"],
    basis: BASIS,
    summary:
      "The JVM executes Java bytecode. The JDK is the development kit, including the compiler. The JRE is the traditional name for the runtime pieces needed to run a Java program.",
    simple:
      "Since Java 9, packaging has changed. A separate JRE download is not always provided by the JDK vendor. In an interview, explain the three roles. Also mention the packaging used by the Java distribution you actually run.",
    points: ["JVM: executes bytecode.", "JRE: runtime environment concept.", "JDK: development kit, including tools such as javac."],
    gap: "No saved source file in the lesson library explains JDK, JRE, and JVM. This answer is prepared.",
    sources: [],
    related: ["java-execution", "class-loading"],
  },
  {
    id: "java-execution",
    group: "execution",
    title: "How does a Java program execute?",
    aliases: ["java program execution", "javac and java", "how java executes"],
    basis: BASIS,
    summary:
      "Java source is compiled into bytecode. The JVM loads the classes and verifies them. It then runs the bytecode by interpreting it, and by compiling hot code just in time when that helps.",
    points: [
      "Write source code in a .java file.",
      "Compile it with javac.",
      "The compiler generates .class bytecode.",
      "The JVM loads and verifies classes.",
      "The JVM executes the bytecode.",
      "The usual commands are javac Main.java, then java Main.",
    ],
    gap: "No saved source file in the lesson library walks through compilation and execution. This answer is prepared.",
    sources: [],
    related: ["jdk-jre-jvm", "class-loading", "compile-vs-runtime"],
  },
  {
    id: "class-loading",
    group: "execution",
    title: "What is class loading in Java?",
    aliases: ["class loading", "class loader", "classloader"],
    basis: BASIS,
    summary:
      "Class loading is how the JVM finds a class and brings it into the runtime. Linking and initialization follow when they are required.",
    simple:
      "The exact loading behavior depends on the runtime and its configuration. This is the standard interview-level explanation.",
    points: [
      "Bootstrap class loader loads core Java classes.",
      "Platform class loader loads platform classes.",
      "Application class loader loads application classes from the configured class path or module path.",
    ],
    gap: "No class-loading file from the original notes is available in the current lesson source list. This answer is prepared and does not cite a page number.",
    sources: [],
    related: ["java-execution", "jdk-jre-jvm"],
  },
  {
    id: "compile-vs-runtime",
    group: "execution",
    title: "What is the difference between compile-time errors and runtime errors?",
    aliases: ["compile time error", "runtime error", "compile time vs runtime"],
    basis: BASIS,
    summary:
      "Compile-time errors prevent source code from compiling successfully. Runtime failures occur while the program is executing.",
    simple:
      "A type mismatch, such as assigning a String to an int, causes a compile-time error. Integer division by zero compiles successfully. It throws ArithmeticException when that line executes.",
    how: "A runtime exception is not the same thing as the Error class in Java's exception hierarchy.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println(e.getClass().getSimpleName());
        }
    }
}`,
      output: "ArithmeticException",
    },
    points: [
      "Compile time: compilation fails.",
      "Runtime: a failure occurs during execution.",
      "A runtime exception is not the same thing as the Error class.",
    ],
    gap: "No saved source file in the lesson library contrasts compile-time errors and runtime failures. This answer is prepared.",
    sources: [],
    related: ["exception-basics", "exception-hierarchy", "java-execution"],
  },
];
