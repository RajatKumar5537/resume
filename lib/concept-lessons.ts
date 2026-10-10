import type { ConceptLesson } from "./concepts";
import { BATCH2 } from "./concept-lessons-batch2";
import { GAPS } from "./concept-lessons-gaps";

const BASIS =
  "Prepared interview explanation. It is not a quotation from a saved PDF or Java file.";

const OOPS = "Interview_PDF/OOPS concept_Java.pdf";
const ARRAYS = "Interview_PDF/Array_Collection_Java.pdf";

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

export const CONCEPTS: ConceptLesson[] = [
  {
    id: "oop-overview",
    group: "oop",
    title: "What is OOP in Java?",
    aliases: ["oop", "oops", "oop concepts", "object oriented programming"],
    basis: BASIS,
    summary:
      "OOP stands for Object-Oriented Programming. It is a way of writing programs using classes and objects. It helps us organize code, reuse functionality, and maintain applications more easily.",
    simple:
      "A class defines the properties and behavior of something. An object is an instance of that class. The four main OOP principles are encapsulation, inheritance, polymorphism, and abstraction.",
    example: {
      code: `class Car {
    String brand;

    void start() {
        System.out.println("Car started");
    }
}

class Main {
    public static void main(String[] args) {
        Car car = new Car();
        car.brand = "Honda";
        car.start();
    }
}`,
      output: "Car started",
    },
    points: [
      "OOP organizes a program around classes and objects.",
      "The four main principles are encapsulation, inheritance, polymorphism, and abstraction.",
    ],
    questions: [
      {
        prompt: "Why do we use OOP?",
        short: "It helps us organize code into reusable classes. It lets us hide internal details. It makes larger applications easier to maintain.",
        detail: "A class defines the properties and behavior. An object is one instance of that class.",
      },
    ],
    sources: [{ label: "OOPS notes", path: OOPS, kind: "pdf", focus: "object" }],
    related: ["classes-objects", "encapsulation", "inheritance", "polymorphism", "abstraction"],
  },
  {
    id: "classes-objects",
    group: "oop",
    title: "What is a class and an object?",
    aliases: ["class and object", "class vs object", "object", "class"],
    basis: BASIS,
    summary: "A class is a blueprint that defines data and behavior. An object is an actual instance created from that class.",
    example: {
      code: `class Employee {
    String name;

    void display() {
        System.out.println(name);
    }
}

class Main {
    public static void main(String[] args) {
        Employee e = new Employee();
        e.name = "Rajat";
        e.display();
    }
}`,
      output: "Rajat",
    },
    points: ["Employee is the class, and e refers to the object created with new Employee()."],
    sources: [{ label: "OOPS notes, object", path: OOPS, kind: "pdf", focus: "object" }],
    related: ["oop-overview", "constructors", "encapsulation"],
  },
  {
    id: "encapsulation",
    group: "oop",
    title: "What is encapsulation?",
    aliases: ["encapsulation", "private variable", "getter setter", "data hiding"],
    basis: BASIS,
    summary:
      "Encapsulation keeps data and the methods that use that data together in one class. It also controls direct access to the internal data.",
    simple:
      "The salary field is private. Other classes cannot read or change it directly. setSalary decides whether a new value is stored.",
    how: "In a Page Object Model, locators can be private. Public methods expose actions such as loginAs(). The example calls setSalary and getSalary so the stored value is visible. getSalary returns 25000.0 because the field is a double.",
    example: {
      code: `class Employee {
    private double salary;

    public void setSalary(double salary) {
        if (salary >= 0) {
            this.salary = salary;
        }
    }

    public double getSalary() {
        return salary;
    }
}

class Main {
    public static void main(String[] args) {
        Employee employee = new Employee();
        employee.setSalary(25000);
        System.out.println(employee.getSalary());
    }
}`,
      output: "25000.0",
    },
    points: [
      "Private data stays inside the class.",
      "Public methods decide how that data is read or changed.",
      "setSalary(25000) stores the value because it is not negative.",
    ],
    questions: [
      {
        prompt: "Why do we use private variables?",
        short: "Private variables protect internal state. The class decides how that data is read or changed.",
        detail: "Other classes cannot assign salary directly. They have to go through setSalary.",
      },
    ],
    sources: [{ label: "OOPS notes, encapsulation", path: OOPS, kind: "pdf", focus: "encapsulation" }],
    related: ["oop-overview", "abstraction", "classes-objects"],
  },
  {
    id: "inheritance",
    group: "oop",
    title: "What is inheritance?",
    aliases: ["inheritance", "extends", "parent child class"],
    basis: BASIS,
    summary:
      "Inheritance lets a child class reuse accessible fields and methods from a parent class. In Java, the child uses extends.",
    simple:
      "Dog can call eat() from Animal. Dog also has its own bark() method. A test class may extend BaseTest when it should reuse setup and teardown.",
    example: {
      code: `class Animal {
    void eat() {
        System.out.println("Eating");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Barking");
    }
}

class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.eat();
        dog.bark();
    }
}`,
      output: "Eating\nBarking",
    },
    points: ["A class uses extends to inherit from one parent class.", "The child reuses accessible fields and methods."],
    questions: [
      {
        prompt: "Does Java support multiple inheritance with classes?",
        short: "No. A class cannot extend more than one class. A class can implement more than one interface.",
        detail: "One class, one parent. A class can still implement more than one interface.",
      },
    ],
    sources: [{ label: "OOPS notes, inheritance", path: OOPS, kind: "pdf", focus: "inheritance" }],
    related: ["oop-overview", "overriding", "polymorphism", "abstract-interface"],
  },
  {
    id: "polymorphism",
    group: "oop",
    title: "What is polymorphism?",
    aliases: ["polymorphism", "explain polymorphism in java", "compile time polymorphism", "runtime polymorphism"],
    basis: BASIS,
    summary:
      "Polymorphism means one method name can represent different behavior. Overloading and overriding are the two common forms in Java.",
    simple:
      "Compile-time polymorphism is method overloading. Runtime polymorphism is method overriding. The reference type here is Animal. The object is a Dog, so Dog.sound() runs.",
    how: "WebDriver driver = new ChromeDriver() uses the same idea. The variable type is the WebDriver interface. The object is a concrete browser driver.",
    example: {
      code: `class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Bark");
    }
}

class Main {
    public static void main(String[] args) {
        Animal animal = new Dog();
        animal.sound();
    }
}`,
      output: "Bark",
    },
    points: [
      "Compile-time polymorphism: method overloading.",
      "Runtime polymorphism: method overriding through dynamic method dispatch.",
      "The reference type can be the parent or the interface.",
      "The real object decides which overridden instance method runs.",
    ],
    sources: [{ label: "OOPS notes, polymorphism", path: OOPS, kind: "pdf", focus: "polymorphism" }],
    related: ["overloading", "overriding", "overloading-overriding", "abstraction"],
  },
  {
    id: "abstraction",
    group: "oop",
    title: "What is abstraction?",
    aliases: ["abstraction", "abstract"],
    basis: BASIS,
    summary:
      "Abstraction shows the operations a caller needs. It hides the internal implementation. Interfaces and abstract classes are the common tools for this in Java.",
    simple:
      "The caller can use the Payment contract without needing to know every internal detail of UpiPayment. The main method calls pay() so the result is printed.",
    example: {
      code: `interface Payment {
    void pay();
}

class UpiPayment implements Payment {
    public void pay() {
        System.out.println("Payment completed");
    }
}

class Main {
    public static void main(String[] args) {
        Payment payment = new UpiPayment();
        payment.pay();
    }
}`,
      output: "Payment completed",
    },
    points: [
      "Show the operation the caller needs.",
      "Hide the internal implementation.",
      "Interfaces and abstract classes are the common Java tools for this.",
      "A concrete method has a method body.",
      "An abstract method has no method body.",
      "You cannot create an object of an abstract class.",
    ],
    questions: [
      {
        prompt: "Is abstraction the same as encapsulation?",
        short: "No. Abstraction shows what an object does and hides the implementation. Encapsulation controls access to an object's internal state.",
        detail: "Payment.pay() is the operation. private salary with setSalary() is controlled access to state.",
      },
    ],
    sources: [{ label: "OOPS notes, abstraction", path: OOPS, kind: "pdf", focus: "abstraction" }],
    related: ["encapsulation", "abstract-interface", "polymorphism"],
  },
  {
    id: "abstract-interface",
    group: "oop",
    title: "Abstract class versus interface",
    aliases: ["abstract class vs interface", "abstract class", "interface vs abstract class"],
    basis: BASIS,
    summary:
      "An abstract class is useful when related classes need shared state or common implementation. An interface defines a contract that different classes can implement.",
    simple: "The main method calls open() on the Browser contract. ChromeBrowser supplies the method body.",
    example: {
      code: `interface Browser {
    void open();
}

class ChromeBrowser implements Browser {
    public void open() {
        System.out.println("Chrome opened");
    }
}

class Main {
    public static void main(String[] args) {
        Browser browser = new ChromeBrowser();
        browser.open();
    }
}`,
      output: "Chrome opened",
    },
    points: ["Choose an abstract class for shared state and behavior.", "Choose an interface for a common contract across implementations."],
    compare: sides("Abstract class and interface", [
      ["Abstract class", "A class can extend only one class.", "Interface", "A class can implement multiple interfaces."],
      ["Abstract class", "Can have constructors and instance fields.", "Interface", "Cannot have constructors or ordinary instance fields."],
      ["Abstract class", "Can contain abstract methods and concrete methods.", "Interface", "Can contain abstract methods. Applicable Java versions also allow default, static, and private methods."],
      ["Abstract class", "Members can have different access modifiers.", "Interface", "Interface fields are implicitly public static final."],
      ["Abstract class", "Useful for shared state and behavior.", "Interface", "Useful for common contracts across implementations."],
    ]),
    questions: [
      {
        prompt: "Is WebDriver a class or an interface?",
        short: "WebDriver is an interface. ChromeDriver is a class that implements it.",
        detail: "The variable can use the interface. The object is a concrete driver class.",
      },
    ],
    sources: [{ label: "OOPS notes, abstraction", path: OOPS, kind: "pdf", focus: "abstraction" }],
    related: ["abstraction", "inheritance", "interfaces-implementations"],
  },
  {
    id: "overloading",
    group: "oop",
    title: "What is method overloading?",
    aliases: ["method overloading", "overloading"],
    basis: BASIS,
    summary:
      "Method overloading means several methods share one name in the same class. Their parameter lists are different.",
    simple: "One method name can handle different inputs. Changing only the return type does not create a valid overload.",
    example: {
      code: `class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }
}

class Main {
    public static void main(String[] args) {
        Calculator c = new Calculator();
        System.out.println(c.add(2, 3));
        System.out.println(c.add(2, 3, 4));
    }
}`,
      output: "5\n9",
    },
    points: ["Same method name, different parameter lists.", "Changing only the return type does not create a valid overloaded method."],
    sources: [{ label: "OOPS notes, overloading", path: OOPS, kind: "pdf", focus: "overloading" }],
    related: ["overriding", "overloading-overriding", "polymorphism"],
  },
  {
    id: "overriding",
    group: "oop",
    title: "What is method overriding?",
    aliases: ["method overriding", "overriding", "override"],
    basis: BASIS,
    summary:
      "Method overriding means a subclass replaces an inherited instance method. The signature and return type must stay compatible.",
    simple: "Parent p = new Child() still calls Child.show(). The reference type is Parent. The object is a Child.",
    example: {
      code: `class Parent {
    void show() {
        System.out.println("Parent");
    }
}

class Child extends Parent {
    @Override
    void show() {
        System.out.println("Child");
    }
}

class Main {
    public static void main(String[] args) {
        Parent p = new Child();
        p.show();
    }
}`,
      output: "Child",
    },
    points: [
      "The subclass replaces an inherited instance method.",
      "The signature and return type must be compatible.",
      "Static methods are hidden. They are not overridden like instance methods.",
      "Private methods are not inherited, so a subclass cannot override them.",
    ],
    sources: [{ label: "OOPS notes, polymorphism", path: OOPS, kind: "pdf", focus: "polymorphism" }],
    related: ["overloading", "overloading-overriding", "inheritance"],
  },
  {
    id: "overloading-overriding",
    group: "oop",
    title: "Overloading versus overriding",
    aliases: ["overloading vs overriding", "overload vs override"],
    basis: BASIS,
    summary: "Overloading lets us use the same method name for different inputs. Overriding lets a child class change inherited behavior.",
    points: ["Overloading is usually resolved at compile time.", "Overriding uses runtime method dispatch."],
    compare: sides("Overloading and overriding", [
      ["Overloading", "Same name, different parameter list.", "Overriding", "Redefines an inherited instance method."],
      ["Overloading", "Usually resolved at compile time.", "Overriding", "Uses runtime method dispatch."],
      ["Overloading", "Can happen within one class.", "Overriding", "Requires an inheritance relationship."],
      ["Overloading", "Return type alone cannot distinguish overloads.", "Overriding", "Return type must be compatible with the overridden method."],
    ]),
    sources: [{ label: "OOPS notes, overloading", path: OOPS, kind: "pdf", focus: "overloading" }],
    related: ["overloading", "overriding", "polymorphism"],
  },
  {
    id: "constructors",
    group: "oop",
    title: "What are constructors?",
    aliases: ["constructor", "constructors", "default constructor", "constructor overloading", "constructor chaining", "parameterized constructor"],
    basis: BASIS,
    summary: "A constructor initializes a new object. Its name matches the class name. It has no return type.",
    example: {
      code: `class Employee {
    String name;

    Employee(String name) {
        this.name = name;
    }
}

class Main {
    public static void main(String[] args) {
        Employee e = new Employee("Rajat");
        System.out.println(e.name);
    }
}`,
      output: "Rajat",
    },
    points: [
      "Constructors can be overloaded.",
      "Constructors are not inherited.",
      "If no constructor is declared, Java provides a default no-argument constructor.",
      "If you declare a constructor yourself, Java does not automatically provide that default constructor.",
      "this() calls another constructor in the same class.",
      "super() calls a parent constructor.",
      "Both calls follow Java's constructor rules.",
    ],
    sources: [{ label: "OOPS notes, constructor", path: OOPS, kind: "pdf", focus: "constructor" }],
    related: ["classes-objects", "this-super", "inheritance"],
  },
  {
    id: "this-super",
    group: "oop",
    title: "What is the difference between this and super?",
    aliases: ["this and super", "this vs super", "super keyword"],
    basis: BASIS,
    summary: "this refers to the current object. super reaches an accessible parent member or a parent constructor.",
    example: {
      code: `class Parent {
    String name = "Parent";
}

class Child extends Parent {
    String name = "Child";

    void display() {
        System.out.println(this.name);
        System.out.println(super.name);
    }
}

class Main {
    public static void main(String[] args) {
        new Child().display();
    }
}`,
      output: "Child\nParent",
    },
    points: ["this.name is the current object's field.", "super.name is the accessible parent field with the same name."],
    sources: [{ label: "OOPS notes, this and super", path: OOPS, kind: "pdf", focus: "super" }],
    related: ["constructors", "inheritance", "overriding"],
  },
  {
    id: "equals-operator",
    group: "oop",
    title: "What is the difference between == and equals()?",
    aliases: ["equals", "==", "== versus equals", "equals method"],
    basis: BASIS,
    summary:
      "For primitives, == compares values. For object references, == checks whether both references point to the same object. equals() checks logical equality when the class implements that behavior.",
    simple: "The strings contain the same text but are different objects.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        String a = new String("Java");
        String b = new String("Java");

        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}`,
      output: "false\ntrue",
    },
    points: ["== on references checks identity.", "equals() checks logical equality when the class implements that behavior."],
    sources: [{ label: "Array and collection notes, equals", path: ARRAYS, kind: "pdf", focus: "equals" }],
    related: ["equals-hashcode", "classes-objects"],
  },
  {
    id: "static-final",
    group: "oop",
    title: "What are static and final?",
    aliases: ["static", "final", "static final"],
    basis: BASIS,
    summary:
      "static means the member belongs to the class, not to one object. final limits change. What it limits depends on whether it is on a variable, a method, or a class.",
    simple: "TIMEOUT belongs to the Config class. It can be assigned only once. The example prints 10.",
    example: {
      code: `class Config {
    static final int TIMEOUT = 10;
}

class Main {
    public static void main(String[] args) {
        System.out.println(Config.TIMEOUT);
    }
}`,
      output: "10",
    },
    points: [
      "A static field is shared at class level.",
      "A final variable can be assigned only once.",
      "A final method cannot be overridden.",
      "A final class cannot be extended.",
      "A final reference cannot point to a different object.",
      "The object it already points to can still change its own state.",
    ],
    sources: [{ label: "OOPS notes, static", path: OOPS, kind: "pdf", focus: "static" }],
    related: ["classes-objects", "overriding", "encapsulation"],
  },
  {
    id: "array-basics",
    group: "arrays",
    title: "What is an array in Java?",
    aliases: ["array", "arrays", "what is an array"],
    basis: BASIS,
    summary:
      "An array stores a fixed number of elements of one declared type. You reach each element by its index. Indexes start at zero.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};

        System.out.println(numbers[0]);
        System.out.println(numbers.length);
    }
}`,
      output: "10\n3",
    },
    points: [
      "Array length is fixed after creation.",
      "Indexing starts at zero.",
      "Accessing an invalid index causes ArrayIndexOutOfBoundsException.",
      "Array elements receive default values when created without explicit values.",
      "Array elements sit in contiguous memory.",
      "The size stays fixed while the program runs.",
      "An array stores one declared type.",
      "Adding, removing, or searching still needs extra logic because the size and indexes are fixed.",
    ],
    sources: [{ label: "Array and collection notes, array", path: ARRAYS, kind: "pdf", focus: "array" }],
    related: ["array-traverse", "array-vs-arraylist", "largest-element"],
  },
  {
    id: "array-traverse",
    group: "arrays",
    title: "How do you traverse an array?",
    aliases: ["traverse an array", "array traversal", "enhanced for loop"],
    basis: BASIS,
    summary:
      "Use a traditional for loop when you need the index. Use an enhanced for loop when you only need each element.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};

        for (int number : numbers) {
            System.out.println(number);
        }
    }
}`,
      output: "10\n20\n30",
    },
    points: ["Use a traditional for loop when the index is needed.", "Use an enhanced for loop when only the element is needed."],
    sources: [{ label: "Array and collection notes, array", path: ARRAYS, kind: "pdf", focus: "array" }],
    related: ["array-basics", "largest-element", "search-sort"],
  },
  {
    id: "largest-element",
    group: "arrays",
    title: "How do you find the largest number in an array?",
    aliases: ["largest", "largest number", "largest element"],
    basis: BASIS,
    summary:
      "Start the maximum with the first element. Compare every later element with it. Replace the maximum when you find a larger value.",
    how: "LargestElement.java is a saved program for this question. It uses its own sample data. This example uses {4, 12, 7, 2, 19}. It prints 19. The wording is prepared. It is not copied from that file.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int[] numbers = {4, 12, 7, 2, 19};
        int max = numbers[0];

        for (int number : numbers) {
            if (number > max) {
                max = number;
            }
        }

        System.out.println(max);
    }
}`,
      output: "19",
    },
    points: ["O(n) time and O(1) extra space.", "This assumes the array is non-empty."],
    sources: [{ label: "LargestElement.java", path: "src/main/java/Java/LargestElement.java", kind: "java" }],
    related: ["largest-second", "array-traverse", "array-basics"],
  },
  {
    id: "largest-second",
    group: "arrays",
    title: "How do you find the second-largest distinct number?",
    aliases: ["second largest", "2nd largest", "second-largest"],
    basis: BASIS,
    summary:
      "Keep the largest distinct value and the second-largest distinct value. Walk the array once. When a new maximum appears, the old maximum becomes second.",
    how: "SecondLargest.java is the saved program for this question. It uses its own sample data. This example uses {6, 3, 5, 67, 7}. It prints 7. The code is prepared. It is not copied from that file.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int[] numbers = {6, 3, 5, 67, 7};

        Integer largest = null;
        Integer second = null;

        for (int number : numbers) {
            if (largest == null || number > largest) {
                second = largest;
                largest = number;
            } else if (number != largest &&
                       (second == null || number > second)) {
                second = number;
            }
        }

        System.out.println(second);
    }
}`,
      output: "7",
    },
    points: [
      "This solution finds the second-largest distinct value.",
      "If the array has fewer than two distinct values, second remains null.",
      "O(n) time and O(1) extra space.",
    ],
    sources: [{ label: "SecondLargest.java", path: "src/main/java/Java/SecondLargest.java", kind: "java" }],
    related: ["nth-largest", "largest-element"],
  },
  {
    id: "nth-largest",
    group: "arrays",
    title: "How do you find the nth-largest distinct number?",
    aliases: ["nth largest", "3rd largest", "third largest", "nth biggest"],
    basis: BASIS,
    summary:
      "Remove duplicates first. Sort the remaining values from largest to smallest. Read the value at index n - 1.",
    simple:
      "The distinct values of {6, 3, 5, 67, 7}, from largest to smallest, are 67, 7, 6, 5, and 3. The third-largest is 6. Ask whether duplicates should count separately. The answer can change if they do.",
    how: "nthBigestElement_Array.java is a saved program for this question. This lesson sorts distinct values and prints 6 for n = 3. The example is prepared. It is not copied from that file.",
    example: {
      code: `import java.util.Arrays;
import java.util.Comparator;

class Main {
    public static void main(String[] args) {
        int[] numbers = {6, 3, 5, 67, 7};

        int[] sorted = Arrays.stream(numbers)
                .distinct()
                .boxed()
                .sorted(Comparator.reverseOrder())
                .mapToInt(Integer::intValue)
                .toArray();

        int n = 3;

        if (n >= 1 && n <= sorted.length) {
            System.out.println(sorted[n - 1]);
        }
    }
}`,
      output: "6",
    },
    points: [
      "Remove the duplicates.",
      "Sort the remaining values from largest to smallest.",
      "Read the value at index n - 1.",
      "A very large array may need a different approach.",
      "Choose that approach from the requirements.",
      "The saved nth-largest file is linked in Source mode.",
      "That file uses its own approach. It is not this stream example.",
    ],
    sources: [
      { label: "nthBigestElement_Array.java", path: "src/main/java/Java/nthBigestElement_Array.java", kind: "java" },
    ],
    related: ["largest-second", "search-sort", "largest-element"],
  },
  {
    id: "duplicates",
    group: "arrays",
    title: "How do you find duplicates in an array?",
    aliases: ["duplicates", "find duplicates", "duplicate numbers"],
    basis: BASIS,
    summary:
      "Use a Set to remember values already seen. If adding a value fails because it already exists, that value is a duplicate.",
    how: "RemoveDuplicateNumberArray.java is a saved program. It uses a HashSet. HashSet does not promise iteration order. This example uses a LinkedHashSet. The duplicates stay in first-seen order: [2, 4]. The example is prepared. It is not copied from that file.",
    example: {
      code: `import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

class Main {
    public static void main(String[] args) {
        int[] numbers = {2, 4, 2, 5, 4};
        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new LinkedHashSet<>();

        for (int number : numbers) {
            if (!seen.add(number)) {
                duplicates.add(number);
            }
        }

        System.out.println(duplicates);
    }
}`,
      output: "[2, 4]",
    },
    points: ["seen.add returns false when the value is already present.", "O(n) average time and O(n) extra space."],
    sources: [
      { label: "RemoveDuplicateNumberArray.java", path: "src/main/java/Java/RemoveDuplicateNumberArray.java", kind: "java" },
    ],
    related: ["set-hashset", "array-basics"],
  },
  {
    id: "reverse-array",
    group: "arrays",
    title: "How do you reverse an array?",
    aliases: ["reverse an array", "reverse array"],
    basis: BASIS,
    summary:
      "Put one pointer at the start and one at the end. Swap those values. Move both pointers toward the center.",
    example: {
      code: `import java.util.Arrays;

class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4};

        int left = 0;
        int right = numbers.length - 1;

        while (left < right) {
            int temp = numbers[left];
            numbers[left] = numbers[right];
            numbers[right] = temp;

            left++;
            right--;
        }

        System.out.println(Arrays.toString(numbers));
    }
}`,
      output: "[4, 3, 2, 1]",
    },
    points: ["O(n) time and O(1) extra space.", "The swap happens in the same array."],
    gap: "The library does not have a saved reverse-array program linked here. This example is prepared.",
    sources: [],
    related: ["array-basics", "array-traverse"],
  },
  {
    id: "search-sort",
    group: "arrays",
    title: "How do you search for an element in an array?",
    aliases: ["linear search", "binary search", "search an array"],
    basis: BASIS,
    summary:
      "Linear search checks one element at a time. It works on sorted and unsorted arrays. Binary search is faster only when the array is already sorted. It keeps cutting the search range in half.",
    how: "LinearSearch.java and BinarySearch.java are saved in Source mode. This page shows a prepared linear search. The target 9 is at index 2. This lesson does not copy the saved binary-search loop. Binary search is O(log n) on sorted data.",
    example: {
      code: `class Main {
    public static void main(String[] args) {
        int[] numbers = {6, 3, 9, 2};
        int target = 9;
        int index = -1;

        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                index = i;
                break;
            }
        }

        System.out.println(index);
    }
}`,
      output: "2",
    },
    points: ["Linear search: O(n).", "Binary search: O(log n) on sorted data.", "Sorting.java is available in Source mode for a saved sort program."],
    sources: [
      { label: "LinearSearch.java", path: "src/main/java/Sorting/LinearSearch.java", kind: "java" },
      { label: "BinarySearch.java", path: "src/main/java/Sorting/BinarySearch.java", kind: "java" },
      { label: "Sorting.java", path: "src/main/java/Sorting/Sorting.java", kind: "java" },
    ],
    related: ["array-basics", "nth-largest", "array-programs"],
  },
  {
    id: "array-vs-arraylist",
    group: "arrays",
    title: "What is the difference between an array and an ArrayList?",
    aliases: ["array vs arraylist", "array versus arraylist"],
    basis: BASIS,
    summary:
      "An array has a fixed length. ArrayList implements List and can grow or shrink. It has methods to add, remove, and read elements.",
    points: ["Use an array when the size is known and fixed, or when a simple indexed structure is sufficient."],
    compare: sides("Array and ArrayList", [
      ["Array", "Fixed length after creation.", "ArrayList", "Grows or shrinks as elements are added or removed."],
      ["Array", "Can store primitives directly.", "ArrayList", "Stores objects; wrapper classes represent primitive values."],
      ["Array", "Uses array.length.", "ArrayList", "Uses list.size()."],
      ["Array", "Uses index syntax such as array[0].", "ArrayList", "Uses methods such as list.get(0)."],
    ]),
    questions: [
      {
        prompt: "When would you use an array?",
        short: "When the size is known and fixed, or when a simple indexed structure is sufficient.",
        detail: "ArrayList is the resizable List when the number of elements can change.",
      },
    ],
    sources: [{ label: "Array and collection notes, array", path: ARRAYS, kind: "pdf", focus: "array" }],
    related: ["array-basics", "list-arraylist"],
  },
  {
    id: "array-programs",
    group: "arrays",
    title: "Saved array programs",
    aliases: ["array programs", "saved array programs"],
    basis: BASIS,
    summary:
      "These Java files are already saved in the library. Open one in Source mode to read the original program. The lesson examples on this page are prepared. They can use different sample data.",
    points: [
      "LargestElement.java finds a largest value in its own array.",
      "SecondLargest.java is the saved second-largest program.",
      "nthBigestElement_Array.java and nthSmallestElement_Array.java are saved nth-value programs.",
      "RemoveDuplicateNumberArray.java removes duplicates with a HashSet.",
      "SumOfArray.java adds the values in its own array.",
      "LinearSearch.java, BinarySearch.java, and Sorting.java are saved search and sort programs.",
    ],
    sources: [
      { label: "LargestElement.java", path: "src/main/java/Java/LargestElement.java", kind: "java" },
      { label: "SecondLargest.java", path: "src/main/java/Java/SecondLargest.java", kind: "java" },
      { label: "nthBigestElement_Array.java", path: "src/main/java/Java/nthBigestElement_Array.java", kind: "java" },
      { label: "nthSmallestElement_Array.java", path: "src/main/java/Java/nthSmallestElement_Array.java", kind: "java" },
      { label: "RemoveDuplicateNumberArray.java", path: "src/main/java/Java/RemoveDuplicateNumberArray.java", kind: "java" },
      { label: "SumOfArray.java", path: "src/main/java/Java/SumOfArray.java", kind: "java" },
      { label: "LinearSearch.java", path: "src/main/java/Sorting/LinearSearch.java", kind: "java" },
      { label: "BinarySearch.java", path: "src/main/java/Sorting/BinarySearch.java", kind: "java" },
      { label: "Sorting.java", path: "src/main/java/Sorting/Sorting.java", kind: "java" },
    ],
    related: ["largest-element", "largest-second", "nth-largest", "duplicates", "search-sort"],
  },
  {
    id: "collection-hierarchy",
    group: "collections",
    title: "What is the Collections Framework?",
    aliases: ["collections framework", "collection framework", "collections"],
    basis: BASIS,
    summary:
      "The Collections Framework gives you interfaces and classes for groups of objects. You use them to store, read, update, and process those objects.",
    simple:
      "The important interfaces are List, Set, Queue, and Map. Map is part of the framework. Map does not extend Collection. A List can store table rows. A Set can detect duplicate IDs. A Map can store test data as key-value pairs.",
    points: [
      "List, Set, and Queue are Collection types.",
      "Map is in the framework and does not extend Collection.",
    ],
    sources: [{ label: "Array and collection notes, collection", path: ARRAYS, kind: "pdf", focus: "collection" }],
    related: ["list-set-map", "list-arraylist", "set-hashset", "map-hashmap", "queue"],
  },
  {
    id: "list-set-map",
    group: "collections",
    title: "What is the difference between List, Set, and Map?",
    aliases: ["list vs set vs map", "list set map", "list vs set", "set vs map"],
    basis: BASIS,
    summary: "List keeps elements in order and allows duplicates. Set stores unique elements. Map stores key-value pairs, and its keys are unique.",
    points: [
      "Order for a Set depends on the implementation.",
      "Order for a Map depends on the implementation.",
      "Map keys are unique.",
      "Map values may repeat.",
    ],
    table: {
      title: "List, Set, and Map",
      headers: ["Feature", "List", "Set", "Map"],
      rows: [
        ["Stores", "Elements", "Unique elements", "Keys and values"],
        ["Duplicates", "Allowed", "Duplicate elements are not allowed", "Keys are unique; values may repeat"],
        ["Order", "Positional order", "Depends on implementation", "Depends on implementation"],
        ["Example", "ArrayList", "HashSet", "HashMap"],
      ],
    },
    sources: [{ label: "Array and collection notes, List", path: ARRAYS, kind: "pdf", focus: "list" }],
    related: ["collection-hierarchy", "list-arraylist", "set-hashset", "map-hashmap"],
  },
  {
    id: "list-arraylist",
    group: "collections",
    title: "What is ArrayList?",
    aliases: ["arraylist", "array list", "list"],
    basis: BASIS,
    summary:
      "ArrayList implements List with a resizable array. It keeps insertion order. It allows duplicates. Reading by index is fast.",
    example: {
      code: `import java.util.ArrayList;
import java.util.List;

class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();

        names.add("Ravi");
        names.add("Amit");
        names.add("Ravi");

        System.out.println(names);
        System.out.println(names.get(1));
    }
}`,
      output: "[Ravi, Amit, Ravi]\nAmit",
    },
    points: [
      "Indexed access: O(1).",
      "Append: amortized O(1).",
      "Inserting or removing near the beginning or middle: O(n) due to shifting.",
    ],
    sources: [{ label: "Array and collection notes, ArrayList", path: ARRAYS, kind: "pdf", focus: "arraylist" }],
    related: ["arraylist-linkedlist", "linkedlist", "array-vs-arraylist", "interfaces-implementations"],
  },
  {
    id: "linkedlist",
    group: "collections",
    title: "What is LinkedList?",
    aliases: ["linkedlist", "linked list"],
    basis: BASIS,
    summary:
      "LinkedList implements List and Deque as a doubly linked list. Adding or removing at either end is efficient. Reading by index requires a walk through the list.",
    points: [
      "Maintains list order.",
      "Allows duplicates and null elements.",
      "Indexed access is O(n).",
      "Adding or removing at an end is O(1).",
      "Inserting in the middle is not automatically O(1). Reaching that position can take O(n).",
      "Saved LinkedList method names include addFirst, addLast, removeFirst, removeLast, getFirst, and getLast.",
    ],
    sources: [{ label: "Array and collection notes, LinkedList", path: ARRAYS, kind: "pdf", focus: "linkedlist" }],
    related: ["arraylist-linkedlist", "list-arraylist", "queue"],
  },
  {
    id: "arraylist-linkedlist",
    group: "collections",
    title: "ArrayList versus LinkedList",
    aliases: ["arraylist vs linkedlist", "arraylist versus linkedlist"],
    basis: BASIS,
    summary:
      "ArrayList is my usual choice for a general list. Index access is fast, and each element uses less extra memory. LinkedList fits when its deque operations match the job. It is not automatically faster for every insert or delete.",
    points: ["Indexed access favors ArrayList.", "Reaching a middle position in a LinkedList still takes traversal."],
    compare: sides("ArrayList and LinkedList", [
      ["ArrayList", "Resizable array", "LinkedList", "Doubly linked list"],
      ["ArrayList", "Fast indexed access", "LinkedList", "Indexed access takes O(n)"],
      ["ArrayList", "Insertions in the middle may shift elements", "LinkedList", "Finding a middle position requires traversal"],
      ["ArrayList", "Generally lower per-element memory overhead", "LinkedList", "Stores links as well as values"],
    ]),
    questions: [
      {
        prompt: "Which is better for frequent queue operations?",
        short: "ArrayDeque is often a better choice than LinkedList for an ordinary queue or stack. Use another implementation only when the requirement asks for it.",
        detail: "LinkedList can act as a deque. That does not make it the default queue.",
      },
    ],
    sources: [{ label: "Array and collection notes, ArrayList and LinkedList", path: ARRAYS, kind: "pdf", focus: "linkedlist" }],
    related: ["list-arraylist", "linkedlist", "queue"],
  },
  {
    id: "set-hashset",
    group: "collections",
    title: "What is Set? HashSet, LinkedHashSet, and TreeSet",
    aliases: ["set", "hashset", "linkedhashset", "treeset"],
    basis: BASIS,
    summary:
      "A Set stores unique elements. HashSet does not promise iteration order. LinkedHashSet keeps insertion order. TreeSet keeps sorted order.",
    example: {
      code: `import java.util.LinkedHashSet;
import java.util.Set;

class Main {
    public static void main(String[] args) {
        Set<Integer> values = new LinkedHashSet<>();

        values.add(3);
        values.add(1);
        values.add(3);
        values.add(2);

        System.out.println(values);
    }
}`,
      output: "[3, 1, 2]",
    },
    points: ["The second add of 3 does not create another element.", "LinkedHashSet keeps the first-seen order."],
    table: {
      title: "Set implementations",
      headers: ["Implementation", "Behavior"],
      rows: [
        ["HashSet", "Unique elements; no guaranteed iteration order"],
        ["LinkedHashSet", "Unique elements; preserves insertion order"],
        ["TreeSet", "Unique elements; sorted according to natural order or a Comparator"],
      ],
    },
    sources: [
      { label: "Array and collection notes, Set", path: ARRAYS, kind: "pdf", focus: "set" },
      { label: "Array and collection notes, TreeSet", path: ARRAYS, kind: "pdf", focus: "treeset" },
    ],
    related: ["duplicates", "map-hashmap", "list-set-map"],
  },
  {
    id: "map-hashmap",
    group: "collections",
    title: "What is Map?",
    aliases: ["map", "key value", "what is map"],
    basis: BASIS,
    summary: "A Map stores key-value pairs. Each key is unique. Different keys can share the same value.",
    simple: "The second put() for C101 replaces its previous value.",
    example: {
      code: `import java.util.HashMap;
import java.util.Map;

class Main {
    public static void main(String[] args) {
        Map<String, String> status = new HashMap<>();

        status.put("C101", "Active");
        status.put("C102", "Paused");
        status.put("C101", "Paused");

        System.out.println(status.get("C101"));
        System.out.println(status.size());
    }
}`,
      output: "Paused\n2",
    },
    points: ["Keys are unique.", "Values may repeat.", "A later put for an equal key replaces that key's value."],
    sources: [
      { label: "Array and collection notes, Map", path: ARRAYS, kind: "pdf", focus: "hashmap" },
      { label: "HashMapExample.java", path: "src/main/java/Java/HashMapExample.java", kind: "java" },
    ],
    related: ["hashmap-internals", "hashmap-collision", "hashmap-hashtable", "list-set-map"],
  },
  {
    id: "hashmap-internals",
    group: "collections",
    title: "What is HashMap, and how does it work internally?",
    aliases: ["hashmap", "hash map", "how hashmap works"],
    basis: BASIS,
    summary:
      "HashMap stores key-value pairs in a hash table. A key's hash selects the bucket. equals() then finds the right key inside that bucket.",
    simple:
      "HashMap calculates a hash from the key. That hash selects a bucket. Several keys can land in the same bucket. That is a collision. HashMap compares the keys to tell those entries apart. A later put for an equal key replaces that key's value. Modern HashMap buckets can start as linked structures. Under particular collision and capacity conditions, a bucket can become a tree.",
    how: "HashMapExample.java is a small saved HashMap program. It does not walk through buckets. The steps and the C101 example on this page are prepared.",
    example: {
      code: `import java.util.HashMap;
import java.util.Map;

class Main {
    public static void main(String[] args) {
        Map<String, String> status = new HashMap<>();

        status.put("C101", "Active");
        status.put("C102", "Paused");
        status.put("C101", "Completed");

        System.out.println(status.get("C101"));
    }
}`,
      output: "Completed",
    },
    points: [
      "Get and put are O(1) on average with well-distributed hashes.",
      "Performance depends on collisions and implementation details.",
      "An equal key replaces the previous value.",
      "A different key can share the same bucket.",
    ],
    sources: [
      { label: "Array and collection notes, HashMap", path: ARRAYS, kind: "pdf", focus: "hashmap" },
      { label: "HashMapExample.java", path: "src/main/java/Java/HashMapExample.java", kind: "java" },
    ],
    related: ["hashmap-collision", "equals-hashcode", "map-hashmap"],
  },
  {
    id: "hashmap-collision",
    group: "collections",
    title: "What is a HashMap collision?",
    aliases: ["hashmap collision", "hash collision", "collision"],
    basis: BASIS,
    summary:
      "A HashMap collision happens when different keys land in the same bucket. HashMap keeps those entries together and compares the keys to find the right one.",
    simple:
      "Different keys can have the same hash code. That does not mean the keys are equal. If two keys are equal according to equals(), they must return the same hashCode(). If you override equals(), you should also override hashCode().",
    points: [
      "A collision puts different keys in the same bucket.",
      "Equal hash codes do not mean the keys are equal.",
      "An equal key replaces the previous value. A different key does not.",
    ],
    questions: [
      {
        prompt: "Does a collision mean one value overwrites another?",
        short: "Not necessarily. Different keys can stay together in the same bucket. A new value replaces the old one only when the key is equal to an existing key.",
        detail: "Same bucket is a collision. Same key, according to equals(), is a replacement.",
      },
    ],
    gap: "The saved collection notes and HashMapExample.java do not explain collisions. This answer is prepared and is not taken from those files.",
    sources: [],
    related: ["hashmap-internals", "equals-hashcode", "map-hashmap"],
  },
  {
    id: "hashmap-hashtable",
    group: "collections",
    title: "What is the difference between HashMap and Hashtable?",
    aliases: ["hashmap vs hashtable", "hashtable", "hash table"],
    basis: BASIS,
    summary:
      "HashMap is not synchronized by default. It allows one null key and null values. Hashtable is an older synchronized Map. It does not allow null keys or null values.",
    simple:
      "For concurrent access, ConcurrentHashMap is usually the better modern choice. Use it when its behavior matches the requirement.",
    points: [
      "HashMap: not synchronized by default, one null key, null values allowed.",
      "Hashtable: legacy synchronized Map, no null keys or values.",
      "ConcurrentHashMap is the usual modern choice for concurrent maps when its behavior fits.",
      "The saved note gives Hashtable a default capacity of 11.",
      "The saved note says Hashtable does not preserve insertion order.",
      "The saved note says only one thread uses a Hashtable method at a time.",
    ],
    sources: [
      { label: "OOPS notes, HashMap and Hashtable", path: OOPS, kind: "pdf", focus: "hashtable" },
      { label: "Array and collection notes, Hashtable", path: ARRAYS, kind: "pdf", focus: "hashtable" },
    ],
    related: ["map-hashmap", "hashmap-internals"],
  },
  {
    id: "queue",
    group: "collections",
    title: "What is Queue?",
    aliases: ["queue", "arraydeque", "fifo"],
    basis: BASIS,
    summary:
      "Queue holds elements until they are processed. Many queues use FIFO order. Priority queues and some other implementations use a different order.",
    simple: "offer() adds an element. poll() removes and returns the head. poll() returns null when the queue is empty.",
    example: {
      code: `import java.util.ArrayDeque;
import java.util.Queue;

class Main {
    public static void main(String[] args) {
        Queue<String> tasks = new ArrayDeque<>();

        tasks.offer("Login");
        tasks.offer("Search");

        System.out.println(tasks.poll());
        System.out.println(tasks.poll());
    }
}`,
      output: "Login\nSearch",
    },
    points: ["Many queues are FIFO.", "Priority and other implementations can use different ordering.", "poll() returns null when the queue is empty."],
    sources: [{ label: "Array and collection notes, Queue", path: ARRAYS, kind: "pdf", focus: "queue" }],
    related: ["linkedlist", "collection-hierarchy", "arraylist-linkedlist"],
  },
  {
    id: "iterator-listiterator",
    group: "collections",
    title: "What is the difference between Iterator and ListIterator?",
    aliases: ["iterator", "listiterator", "list iterator"],
    basis: BASIS,
    summary:
      "Iterator walks a collection forward. ListIterator works only with lists. It can walk forward and backward. It can also add or replace elements where the list allows it.",
    points: [
      "Iterator: forward traversal and optional removal.",
      "ListIterator can move forward and backward. Where the list allows it, ListIterator can also add, replace, or remove.",
    ],
    gap: "The saved collection note has an Iterator heading. It does not have a separate ListIterator lesson. The ListIterator points are prepared.",
    sources: [{ label: "Array and collection notes, Iterator", path: ARRAYS, kind: "pdf", focus: "iterator" }],
    related: ["list-arraylist", "collection-hierarchy"],
  },
  {
    id: "equals-hashcode",
    group: "collections",
    title: "What are equals() and hashCode()?",
    aliases: ["hashcode", "hash code", "equals and hashcode"],
    basis: BASIS,
    summary:
      "equals() checks logical equality when a class defines that behavior. hashCode() returns an int that hash-based collections use to place the object.",
    simple:
      "If equals() says two objects are equal, their hash codes must match. The same hash code does not prove the objects are equal. HashMap and HashSet depend on this contract.",
    points: [
      "Equal objects must share a hash code.",
      "The same hash code does not prove that two objects are equal.",
      "HashMap and HashSet depend on this contract.",
    ],
    sources: [{ label: "Array and collection notes, hashCode", path: ARRAYS, kind: "pdf", focus: "hashcode" }],
    related: ["equals-operator", "hashmap-internals", "set-hashset"],
  },
  {
    id: "interfaces-implementations",
    group: "collections",
    title: "Interface and implementation",
    aliases: ["interface vs implementation", "list interface", "declare list"],
    basis: BASIS,
    summary:
      "The interface is the contract. The class is the storage. ArrayList is a resizable array that implements List.",
    simple:
      "List<String> names = new ArrayList<>() keeps the rest of the code on List. WebDriver is an interface. ChromeDriver is a class that implements it.",
    points: [
      "Declare the interface when the caller only needs the contract.",
      "Create the concrete class that matches the required behavior.",
      "A class can implement multiple interfaces. A class can extend only one class.",
    ],
    sources: [{ label: "Array and collection notes, List", path: ARRAYS, kind: "pdf", focus: "list" }],
    related: ["list-arraylist", "abstract-interface", "set-hashset"],
  },
  ...BATCH2,
  ...GAPS,
];
