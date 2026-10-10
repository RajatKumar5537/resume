import type { ConceptLesson, ConceptSource } from "./concepts";

const BASIS =
  "Prepared interview explanation. It is not a quotation from a saved PDF or Java file.";

const OOPS = "Interview_PDF/OOPS concept_Java.pdf";
const ARRAYS = "Interview_PDF/Array_Collection_Java.pdf";

const JAVA_PROGRAMS = [
  "src/main/java/Java/ArmstrongNumber.java",
  "src/main/java/Java/AvarageNumber.java",
  "src/main/java/Java/CountNumberDigit.java",
  "src/main/java/Java/CountPrimeNumberInArray.java",
  "src/main/java/Java/EvenOdd_Number.java",
  "src/main/java/Java/Factorial.java",
  "src/main/java/Java/FibonacciSeries.java",
  "src/main/java/Java/FibonacciSeriesWithoutLoop.java",
  "src/main/java/Java/HashMapExample.java",
  "src/main/java/Java/LargestElement.java",
  "src/main/java/Java/LeapYear.java",
  "src/main/java/Java/NeonNumber.java",
  "src/main/java/Java/PalindromeNumber.java",
  "src/main/java/Java/PerfectNumber.java",
  "src/main/java/Java/PrimeNumber.java",
  "src/main/java/Java/PrintLastDigit.java",
  "src/main/java/Java/RemoveDuplicateAlphabate.java",
  "src/main/java/Java/RemoveDuplicateNumberArray.java",
  "src/main/java/Java/RemoveLastDigit.java",
  "src/main/java/Java/ReplaceCharacter.java",
  "src/main/java/Java/ReverseNumber.java",
  "src/main/java/Java/SecondLargest.java",
  "src/main/java/Java/SpecialTwoDigit.java",
  "src/main/java/Java/SpyNumber.java",
  "src/main/java/Java/StrongNumber.java",
  "src/main/java/Java/StudentTeacherExample.java",
  "src/main/java/Java/SumOfArray.java",
  "src/main/java/Java/SumOfEvenOddIndex.java",
  "src/main/java/Java/SwapNumber.java",
  "src/main/java/Java/UniqueCombinations.java",
  "src/main/java/Java/nthBigestElement_Array.java",
  "src/main/java/Java/nthSmallestElement_Array.java",
];

const STRING_PROGRAMS = [
  "src/main/java/StringProgram/Anagram_String.java",
  "src/main/java/StringProgram/Convert_String_LowerCase.java",
  "src/main/java/StringProgram/Convert_To_InitCap.java",
  "src/main/java/StringProgram/Convert_To_InitLow.java",
  "src/main/java/StringProgram/Count_SumOfDigit.java",
  "src/main/java/StringProgram/Count_UpperLowerSpecialCharacter.java",
  "src/main/java/StringProgram/Count_VowelConsonant.java",
  "src/main/java/StringProgram/Count_Words_String.java",
  "src/main/java/StringProgram/LargestStringInArray.java",
  "src/main/java/StringProgram/Palindrome_String.java",
  "src/main/java/StringProgram/Revers_String.java",
  "src/main/java/StringProgram/Reverse_Sentence.java",
  "src/main/java/StringProgram/Reverse_Word_Sentence.java",
  "src/main/java/StringProgram/SwapStrings.java",
];

const SORT_PROGRAMS = [
  "src/main/java/Sorting/BinarySearch.java",
  "src/main/java/Sorting/LinearSearch.java",
  "src/main/java/Sorting/Sorting.java",
];

const PATTERN_PROGRAMS = [
  "src/main/java/Pattern_Program/AlphabetGrid_A_P.java",
  "src/main/java/Pattern_Program/AlphabetGrid_a_e.java",
  "src/main/java/Pattern_Program/DescendingNumberGrid_4321.java",
  "src/main/java/Pattern_Program/FourStar.java",
  "src/main/java/Pattern_Program/Interview_AscendingAsteriskPyramid.java",
  "src/main/java/Pattern_Program/Interview_DescendingAsteriskPyramid.java",
  "src/main/java/Pattern_Program/Interview_DescendingNumberPyramid_9_6.java",
  "src/main/java/Pattern_Program/Interview_IncrementalNumberTriangle_0_9.java",
  "src/main/java/Pattern_Program/Interview_InvertedPyramidNumberPattern_5_12345.java",
  "src/main/java/Pattern_Program/Interview_RepeatingNumberTriangle_1_4444.java",
  "src/main/java/Pattern_Program/Interview_RightAlignedAsteriskTriangle.java",
  "src/main/java/Pattern_Program/NumberGrid_1_16.java",
  "src/main/java/Pattern_Program/Number_Letter_Pattern_1234_abcd.java",
  "src/main/java/Pattern_Program/PyramidPattern_1_25_A_I.java",
  "src/main/java/Pattern_Program/Pyramid_Patern_1_9_A_I.java",
  "src/main/java/Pattern_Program/RepeatingNumberGrid_1_4.java",
  "src/main/java/Pattern_Program/Two_Triangle_MirroredAsteriskPyramid.java",
];

export const PRACTICE_PATHS = [...JAVA_PROGRAMS, ...STRING_PROGRAMS, ...SORT_PROGRAMS, ...PATTERN_PROGRAMS];

function fileSources(paths: string[]): ConceptSource[] {
  return paths.map((path) => ({
    label: path.split("/").pop() || path,
    path,
    kind: "java" as const,
  }));
}

function filePoints(paths: string[]): string[] {
  return paths.map((path) => `${path.split("/").pop()} is saved. Open it in Source mode for the original program.`);
}

export const GAPS: ConceptLesson[] = [
  {
    id: "inheritance-types",
    group: "oop",
    title: "What are the types of inheritance?",
    aliases: ["types of inheritance", "single level inheritance", "multilevel inheritance", "hierarchical inheritance", "hybrid inheritance"],
    basis: BASIS,
    summary: "The saved notes name five inheritance shapes. Java classes can use only the shapes that need one parent.",
    simple:
      "Single-level means one child extends one parent. Multi-level means a grandchild extends a child that extends a parent. Hierarchical means several children extend the same parent. Generalization moves shared members upward. Specialization adds members that belong only to the lower class.",
    points: [
      "Single-level: one child, one parent.",
      "Multi-level: inheritance continues through more than one level.",
      "Hierarchical: one parent, more than one child.",
      "Multiple: one class extending more than one class.",
      "Hybrid: a mix of more than one inheritance shape.",
      "Generalization builds the parent from shared child members.",
      "Specialization adds behavior that belongs only to a child.",
    ],
    how: "The saved OOPS note lists multiple inheritance as a type. A Java class cannot extend more than one class. A class can implement more than one interface. Hybrid inheritance is not a separate Java keyword. One saved heading uses the words multiple inheritance for a Parent, Child, and GrandChild chain. That chain is multi-level inheritance. The same note uses a framework BaseClass as an inheritance example. That example is framework usage. The Java rule is still extends and implements.",
    sources: [{ label: "OOPS notes, inheritance", path: OOPS, kind: "pdf", focus: "inheritance" }],
    related: ["inheritance", "abstract-interface"],
  },
  {
    id: "shadowing",
    group: "oop",
    title: "What is shadowing?",
    aliases: ["shadowing", "variable shadowing"],
    basis: BASIS,
    summary: "Shadowing happens when a local variable uses the same name as a field. The local name hides the field inside that block.",
    simple: "The saved note lists shadowing with method overloading and constructor overloading under compile-time polymorphism. The compiler decides which name is visible.",
    points: [
      "A parameter or local variable can hide a field with the same name.",
      "this.field reaches the field when a parameter hides it.",
      "The saved note groups shadowing with compile-time polymorphism.",
    ],
    sources: [{ label: "OOPS notes, polymorphism", path: OOPS, kind: "pdf", focus: "shadowing" }],
    related: ["overloading", "this-super", "polymorphism"],
  },
  {
    id: "static-members",
    group: "oop",
    title: "What are static and non-static members?",
    aliases: ["static block", "static initializer", "instance initializer", "non static members"],
    basis: BASIS,
    summary: "A static member belongs to the class. A non-static member belongs to an object.",
    simple:
      "Static members are the static variable, the static method, and the static initializer. Non-static members are the instance variable, the instance method, the instance initializer, and the constructor. A static block runs once when the class is loaded. An instance initializer runs each time an object is created, before the constructor body.",
    example: {
      code: `class Demo {
    static int count = 1;

    static {
        count = 2;
    }
}

class Main {
    public static void main(String[] args) {
        System.out.println(Demo.count);
    }
}`,
      output: "2",
    },
    points: [
      "A static variable is shared by the class.",
      "A static method can be called without an object.",
      "A static block runs once during class initialization.",
      "Each object has its own instance variables.",
      "An instance method needs an object.",
      "An instance initializer runs before the constructor body.",
    ],
    how: "The saved note describes class loading as creating the static area, loading methods, giving static variables default values, and running static initializers. That is class initialization. It is not the same topic as the bootstrap, platform, and application class loaders.",
    sources: [{ label: "OOPS notes, static", path: OOPS, kind: "pdf", focus: "static" }],
    related: ["static-final", "class-loading", "constructors"],
  },
  {
    id: "comparable-comparator",
    group: "collections",
    title: "What is the difference between Comparable and Comparator?",
    aliases: ["comparable", "comparator", "compareto"],
    basis: BASIS,
    summary: "Comparable defines one natural order inside the class. Comparator defines an order outside the class.",
    simple: "Comparable uses compareTo. Comparator uses compare. A class has one compareTo. You can write more than one Comparator.",
    example: {
      code: `class Score implements Comparable<Score> {
    int value;

    Score(int value) {
        this.value = value;
    }

    public int compareTo(Score other) {
        return Integer.compare(this.value, other.value);
    }
}

class Main {
    public static void main(String[] args) {
        System.out.println(new Score(5).compareTo(new Score(8)));
    }
}`,
      output: "-1",
    },
    points: [
      "compareTo belongs on the class.",
      "compare belongs on a separate Comparator.",
      "TreeSet uses the natural order unless you pass a Comparator.",
    ],
    how: "The saved OOPS note states this difference. This example is prepared. It is not copied from that note.",
    sources: [{ label: "OOPS notes, Comparable and Comparator", path: OOPS, kind: "pdf", focus: "comparable" }],
    related: ["set-hashset", "sorting-basics"],
  },
  {
    id: "singleton",
    group: "oop",
    title: "What is the Singleton pattern?",
    aliases: ["singleton", "singleton design pattern"],
    basis: BASIS,
    summary: "Singleton keeps one instance of a class. The class gives that same instance to every caller.",
    simple: "Make the constructor private. Keep one static instance. Return that instance from a static method.",
    example: {
      code: `class Settings {
    private static final Settings INSTANCE = new Settings();

    private Settings() {
    }

    static Settings getInstance() {
        return INSTANCE;
    }
}

class Main {
    public static void main(String[] args) {
        System.out.println(Settings.getInstance() == Settings.getInstance());
    }
}`,
      output: "true",
    },
    points: [
      "The private constructor blocks new Settings() from other classes.",
      "getInstance() returns the one object.",
      "Both calls refer to the same object, so == prints true.",
    ],
    sources: [{ label: "OOPS notes, Singleton", path: OOPS, kind: "pdf", focus: "singleton" }],
    related: ["constructors", "static-members"],
  },
  {
    id: "interface-rules",
    group: "oop",
    title: "What rules apply to an interface declaration?",
    aliases: ["interface rules", "cannot instantiate interface", "interface object"],
    basis: BASIS,
    summary: "An interface is a contract. You cannot create an object from the interface itself.",
    simple: "A class implements the interface and supplies the method bodies. The interface declaration is public or package-private.",
    points: [
      "You cannot write new on the interface type alone.",
      "The interface declaration cannot be private, protected, or final.",
      "The saved note says an interface can be compiled into a class file.",
      "Interface fields are public, static, and final.",
      "A static interface method is not inherited.",
      "An abstract interface method is inherited as part of the contract.",
    ],
    how: "The saved note says an interface cannot be private. That statement is about the interface declaration. Applicable Java versions can still have private interface methods. The abstract-class lesson covers those methods.",
    sources: [{ label: "OOPS notes, interface", path: OOPS, kind: "pdf", focus: "interface" }],
    related: ["abstract-interface", "abstraction"],
  },
  {
    id: "string-constructors",
    group: "strings",
    title: "What String constructors are commonly used?",
    aliases: ["string constructor", "string valueof", "valueof"],
    basis: BASIS,
    summary: "The saved notes show three String constructors. They also show valueOf for a character array.",
    simple: "new String() creates an empty String. new String(text) copies an existing String. new String(characters) copies a char array. String.valueOf(characters) also builds a String from that array.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String empty = new String();
        String copy = new String("Java");
        char[] letters = {'J', 'a', 'v', 'a'};
        String fromChars = new String(letters);
        String fromValue = String.valueOf(letters);

        System.out.println(empty.length());
        System.out.println(copy);
        System.out.println(fromChars);
        System.out.println(fromValue);
    }
}`,
      output: "0\nJava\nJava\nJava",
    },
    points: [
      "String() creates an empty String.",
      "String(String) copies a String.",
      "String(char[]) copies a character array.",
      "String.valueOf(char[]) also converts a character array.",
    ],
    sources: [{ label: "OOPS notes, String", path: OOPS, kind: "pdf", focus: "string" }],
    related: ["string-basics", "string-char-array"],
  },
  {
    id: "string-methods",
    group: "strings",
    title: "Which String methods should I remember?",
    aliases: ["string methods", "substring", "trim", "equalsignorecase"],
    basis: BASIS,
    summary: "The saved String note lists the methods used most often in interviews. Each method returns a result. It does not change the original String.",
    simple: "trim removes leading and trailing spaces. substring builds a new String from a start index up to, but not including, an end index. indexOf returns the first matching position, or -1 when the text is absent.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String text = " Java ";
        String trimmed = text.trim();
        System.out.println(trimmed);
        System.out.println(trimmed.substring(1, 3));
        System.out.println(trimmed.indexOf("av"));
    }
}`,
      output: "Java\nav\n1",
    },
    points: [
      "length() returns the character count.",
      "toUpperCase() and toLowerCase() return a new String.",
      "concat() joins text and returns a new String.",
      "contains() reports whether a sequence is present.",
      "indexOf(char) and indexOf(String) return a position, or -1.",
      "substring(start) runs through the end of the String.",
      "substring(start, end) stops before the end index.",
      "getBytes() returns the bytes of the String.",
      "split() breaks one String into several Strings.",
      "startsWith() and endsWith() check the ends.",
      "trim() removes leading and trailing whitespace.",
      "equals() checks content. equalsIgnoreCase() ignores letter case.",
      "compareTo() compares two Strings in order.",
      "hashCode() returns the String hash code.",
    ],
    how: "The saved note spells one method equalsIgnorCase. The Java method name is equalsIgnoreCase. charAt and toCharArray already have their own lessons.",
    sources: [{ label: "OOPS notes, String methods", path: OOPS, kind: "pdf", focus: "substring" }],
    related: ["string-basics", "string-charat", "string-equals"],
  },
  {
    id: "length-field-method",
    group: "arrays",
    title: "What is the difference between length and length()?",
    aliases: ["array length vs string length", "length versus length method"],
    basis: BASIS,
    summary: "length is a field on an array. length() is a method on a String.",
    simple: "numbers.length needs no parentheses. text.length() is a method call.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};
        String text = "Java";
        System.out.println(numbers.length);
        System.out.println(text.length());
    }
}`,
      output: "3\n4",
    },
    points: ["Array length is fixed when the array is created.", "String length() counts the characters in that String."],
    sources: [{ label: "Array and collection notes, length", path: ARRAYS, kind: "pdf", focus: "length" }],
    related: ["array-basics", "string-methods"],
  },
  {
    id: "collection-methods",
    group: "collections",
    title: "Which Collection methods should I remember?",
    aliases: ["collection methods", "addall", "containsall", "retainall"],
    basis: BASIS,
    summary: "Collection is the shared contract for List, Set, and Queue. Its methods add, search, remove, and read a group of objects.",
    simple: "add stores one element. contains searches for one element. remove deletes one matching element. A collection stores objects, not primitive values.",
    example: {
      code: `import java.util.ArrayList;
import java.util.Collection;

class Main {
    public static void main(String[] args) {
        Collection<String> items = new ArrayList<>();
        items.add("Java");
        System.out.println(items.contains("Java"));
        items.remove("Java");
        System.out.println(items.isEmpty());
    }
}`,
      output: "true\ntrue",
    },
    points: [
      "add(Object) and addAll(Collection) insert elements.",
      "contains(Object) and containsAll(Collection) search.",
      "remove(Object), removeAll, retainAll, and clear delete.",
      "Iterator and the enhanced for loop read the elements.",
      "Map is not a Collection.",
    ],
    sources: [{ label: "Array and collection notes, Collection", path: ARRAYS, kind: "pdf", focus: "collection" }],
    related: ["collection-hierarchy", "list-arraylist", "iterator-methods"],
  },
  {
    id: "list-methods",
    group: "collections",
    title: "Which List methods should I remember?",
    aliases: ["list methods", "indexof", "list set method"],
    basis: BASIS,
    summary: "List keeps insertion order and an index. Its extra methods use that index.",
    simple: "add(index, element) inserts at a position. get(index) reads that position. indexOf finds the first matching element.",
    example: {
      code: `import java.util.ArrayList;
import java.util.List;

class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ravi");
        names.add(0, "Amit");
        System.out.println(names.get(0));
        System.out.println(names.indexOf("Ravi"));
    }
}`,
      output: "Amit\n1",
    },
    points: [
      "add(index, element) and addAll(index, collection) insert by index.",
      "get(index) reads one element.",
      "set(index, element) replaces one element.",
      "remove(index) deletes by position.",
      "indexOf reports the first match.",
      "size, isEmpty, toArray, hashCode, and equals are also on List.",
      "Saved ArrayList names also include Collections.sort and Collections.shuffle.",
      "The saved note spells shuffle as suffle. The Java method is Collections.shuffle.",
      "The saved note spells containsAll as conatinsAll. The Java method is containsAll.",
    ],
    sources: [{ label: "Array and collection notes, List", path: ARRAYS, kind: "pdf", focus: "list" }],
    related: ["list-arraylist", "linkedlist", "collection-methods"],
  },
  {
    id: "hashset-details",
    group: "collections",
    title: "What should I remember about HashSet capacity?",
    aliases: ["hashset capacity", "load factor", "hashset null"],
    basis: BASIS,
    summary: "HashSet stores unique elements and allows one null. A new HashSet starts with room for 16 elements.",
    simple: "The default load factor is 0.75. When the set grows past that fraction of its capacity, it resizes.",
    points: [
      "HashSet does not promise iteration order.",
      "HashSet allows one null element.",
      "The default initial capacity is 16.",
      "The default load factor is 0.75.",
      "LinkedHashSet also starts at 16 and keeps insertion order.",
      "Saved HashSet method names include add, addAll, remove, removeAll, contains, containsAll, and isEmpty.",
      "The saved note also names union, intersection, difference, and subset as HashSet checks.",
    ],
    how: "The saved note writes the load factor as 0.75 percent. The Java load factor is the fraction 0.75, not 0.75 percent. HashSet can hold mixed reference types. TreeSet is stricter and is covered separately.",
    sources: [{ label: "Array and collection notes, HashSet", path: ARRAYS, kind: "pdf", focus: "hashset" }],
    related: ["set-hashset", "duplicates"],
  },
  {
    id: "treeset-treemap",
    group: "collections",
    title: "What are TreeSet and TreeMap?",
    aliases: ["treeset constructors", "treemap", "classcastexception treeset"],
    basis: BASIS,
    summary: "TreeSet stores unique elements in sorted order. TreeMap stores key-value pairs in sorted key order.",
    simple: "TreeSet() creates an empty set. TreeSet(collection) copies another collection and sorts it. TreeMap() creates an empty map. TreeMap(map) copies another map.",
    example: {
      code: `import java.util.TreeMap;
import java.util.TreeSet;

class Main {
    public static void main(String[] args) {
        TreeSet<Integer> values = new TreeSet<>();
        values.add(3);
        values.add(1);
        values.add(2);
        System.out.println(values);

        TreeMap<String, String> status = new TreeMap<>();
        status.put("C102", "Paused");
        status.put("C101", "Active");
        System.out.println(status.firstKey());
    }
}`,
      output: "[1, 2, 3]\nC101",
    },
    points: [
      "TreeSet rejects duplicate elements.",
      "TreeSet has no index.",
      "Elements must be mutually comparable.",
      "A bad comparison throws ClassCastException.",
      "TreeMap sorts by key.",
    ],
    how: "The saved note says TreeSet elements must be the same comparable type. Mixed types that cannot be compared throw ClassCastException. This example is prepared.",
    sources: [{ label: "Array and collection notes, TreeSet", path: ARRAYS, kind: "pdf", focus: "treeset" }],
    related: ["set-hashset", "comparable-comparator", "map-hashmap"],
  },
  {
    id: "queue-methods",
    group: "collections",
    title: "What is the difference between add, offer, remove, and poll?",
    aliases: ["offer vs add", "poll vs remove", "peek vs element"],
    basis: BASIS,
    summary: "add and offer insert. remove and poll take the head. element and peek only read the head.",
    simple: "offer returns false when it cannot insert. poll returns null when the queue is empty. add and remove throw an exception for those same failure cases.",
    example: {
      code: `import java.util.ArrayDeque;
import java.util.Queue;

class Main {
    public static void main(String[] args) {
        Queue<String> tasks = new ArrayDeque<>();
        System.out.println(tasks.offer("Login"));
        System.out.println(tasks.peek());
        System.out.println(tasks.poll());
        System.out.println(tasks.poll());
    }
}`,
      output: "true\nLogin\nLogin\nnull",
    },
    points: [
      "add throws when the insert fails. offer returns false.",
      "remove throws when the queue is empty. poll returns null.",
      "element throws when the queue is empty. peek returns null.",
      "The example uses offer, peek, and poll so the empty queue prints null.",
    ],
    how: "The saved note says element and peek return true when a head exists. They return the head element. An empty queue makes element throw and peek return null. This example uses offer, peek, and poll so the empty queue prints null.",
    sources: [{ label: "Array and collection notes, Queue", path: ARRAYS, kind: "pdf", focus: "queue" }],
    related: ["queue", "priority-queue"],
  },
  {
    id: "priority-queue",
    group: "collections",
    title: "What is PriorityQueue?",
    aliases: ["priorityqueue", "priority queue"],
    basis: BASIS,
    summary: "PriorityQueue processes elements by priority, not only by arrival time.",
    simple: "For integers, the smallest value is the head. poll removes that head. The saved note also says duplicates are allowed and mixed types are not.",
    example: {
      code: `import java.util.PriorityQueue;

class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> numbers = new PriorityQueue<>();
        numbers.add(20);
        numbers.add(5);
        numbers.add(12);
        System.out.println(numbers.poll());
    }
}`,
      output: "5",
    },
    points: [
      "The head is decided by priority.",
      "Natural order for Integer puts the smallest value first.",
      "Duplicates are allowed.",
      "Elements must be mutually comparable.",
    ],
    how: "The saved note says PriorityQueue allows insertion order. Do not describe it as a FIFO queue. FIFO is the usual Queue story. PriorityQueue orders by priority.",
    sources: [{ label: "Array and collection notes, PriorityQueue", path: ARRAYS, kind: "pdf", focus: "priorityqueue" }],
    related: ["queue", "queue-methods", "comparable-comparator"],
  },
  {
    id: "hashmap-methods",
    group: "collections",
    title: "Which HashMap methods should I remember?",
    aliases: ["hashmap methods", "keyset", "containskey", "entryset"],
    basis: BASIS,
    summary: "HashMap stores one value for each key. put adds or replaces. get reads. containsKey checks the key.",
    simple: "One null key is allowed. Null values are allowed more than once. Insertion order is not promised.",
    example: {
      code: `import java.util.HashMap;
import java.util.Map;

class Main {
    public static void main(String[] args) {
        Map<String, String> status = new HashMap<>();
        status.put("C101", "Active");
        System.out.println(status.containsKey("C101"));
        System.out.println(status.get("C101"));
        System.out.println(status.size());
    }
}`,
      output: "true\nActive\n1",
    },
    points: [
      "put and putAll store entries.",
      "containsKey and containsValue search.",
      "get returns the value for a key.",
      "keySet returns the keys.",
      "values returns the values.",
      "entrySet returns the pairs.",
      "remove, clear, size, and isEmpty update or inspect the map.",
    ],
    sources: [{ label: "Array and collection notes, HashMap", path: ARRAYS, kind: "pdf", focus: "hashmap" }],
    related: ["map-hashmap", "hashmap-internals", "hashmap-hashtable"],
  },
  {
    id: "iterator-methods",
    group: "collections",
    title: "Which Iterator and ListIterator methods should I remember?",
    aliases: ["iterator methods", "hasnext", "listiterator methods"],
    basis: BASIS,
    summary: "Iterator reads forward. ListIterator reads forward and backward on a list.",
    simple: "hasNext asks whether another element exists. next returns that element. remove deletes the element just returned.",
    example: {
      code: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ravi");
        names.add("Amit");
        Iterator<String> cursor = names.iterator();
        System.out.println(cursor.hasNext());
        System.out.println(cursor.next());
    }
}`,
      output: "true\nRavi",
    },
    points: [
      "Iterator methods: hasNext, next, and remove.",
      "Iterator can walk List, Set, and Queue.",
      "ListIterator also has hasPrevious, previous, nextIndex, and previousIndex.",
      "ListIterator can add and set.",
      "ListIterator works only with lists.",
    ],
    how: "The saved note says Iterator cannot modify an element. remove is still a real Iterator method. ListIterator set replaces an element. This example is prepared.",
    sources: [{ label: "Array and collection notes, Iterator", path: ARRAYS, kind: "pdf", focus: "iterator" }],
    related: ["iterator-listiterator", "list-methods"],
  },
  {
    id: "sorting-basics",
    group: "arrays",
    title: "How do you sort in Java?",
    aliases: ["sorting", "arrays sort", "bubble sort"],
    basis: BASIS,
    summary: "Sorting arranges elements in ascending or descending order. Arrays.sort is the built-in way for an array.",
    simple: "The saved note also names bubble sort, selection sort, insertion sort, merge sort, heap sort, and quick sort. Sorting.java is the saved program.",
    example: {
      code: `import java.util.Arrays;

class Main {
    public static void main(String[] args) {
        int[] numbers = {20, 50, 80, 60};
        Arrays.sort(numbers);
        System.out.println(Arrays.toString(numbers));
    }
}`,
      output: "[20, 50, 60, 80]",
    },
    points: [
      "Arrays.sort arranges the array in natural ascending order.",
      "Bubble sort, selection sort, and insertion sort are simple algorithms.",
      "Merge sort, heap sort, and quick sort are the other names in the saved note.",
    ],
    how: "The saved note writes Array.sort. The Java call is Arrays.sort. This example is prepared. The original Sorting.java stays available in Source mode.",
    sources: [{ label: "Sorting.java", path: "src/main/java/Sorting/Sorting.java", kind: "java" }],
    related: ["search-sort", "comparable-comparator"],
  },
  {
    id: "object-class",
    group: "oop",
    title: "What methods does Object provide?",
    aliases: ["object class", "tostring", "getclass", "wait notify"],
    basis: BASIS,
    summary: "Object is the top class in Java. Every class inherits its methods.",
    simple: "getClass tells you the runtime class. toString returns the text form. The saved note lists 11 Object methods.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String text = "Java";
        System.out.println(text.getClass().getSimpleName());
        System.out.println(text.toString());
    }
}`,
      output: "String\nJava",
    },
    points: [
      "toString returns a text form.",
      "equals compares objects. The Object version compares identity until a class overrides it.",
      "hashCode supports hash-based collections.",
      "clone copies an object when cloning is allowed.",
      "finalize was the old cleanup hook.",
      "wait, wait(long), and wait(long, int) pause a thread.",
      "notify and notifyAll wake waiting threads.",
      "getClass returns the runtime class.",
    ],
    how: "The saved note calls getClass a final public class method. getClass is a final method that returns Class. It is not itself a class declaration. equals and hashCode already have their own lessons.",
    sources: [{ label: "Array and collection notes, Object", path: ARRAYS, kind: "pdf", focus: "object" }],
    related: ["equals-hashcode", "equals-operator", "final-finally-finalize"],
  },
  {
    id: "number-programs",
    group: "arrays",
    title: "Saved number and array programs",
    aliases: ["number programs", "prime number program", "factorial program", "fibonacci program"],
    basis: BASIS,
    summary: "These Java files are saved practice programs. Open one in Source mode to read the original file.",
    simple: "The lesson examples elsewhere may use different sample data. These buttons open the original programs.",
    points: filePoints(JAVA_PROGRAMS),
    sources: fileSources(JAVA_PROGRAMS),
    related: ["array-programs", "string-programs"],
  },
  {
    id: "string-programs",
    group: "strings",
    title: "Saved string programs",
    aliases: ["string programs", "anagram program", "palindrome string program"],
    basis: BASIS,
    summary: "These string practice files are saved. Open one in Source mode to read the original program.",
    simple: "They are not the source of the String lesson wording. The lessons explain the ideas. These files are the original programs.",
    points: filePoints(STRING_PROGRAMS),
    sources: fileSources(STRING_PROGRAMS),
    related: ["string-basics", "string-methods"],
  },
  {
    id: "pattern-programs",
    group: "arrays",
    title: "Saved pattern programs",
    aliases: ["pattern programs", "star pattern", "number pattern"],
    basis: BASIS,
    summary: "These pattern files are saved Java programs. Open one in Source mode to read the original file.",
    points: filePoints(PATTERN_PROGRAMS),
    sources: fileSources(PATTERN_PROGRAMS),
    related: ["number-programs"],
  },
];
