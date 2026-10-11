import { BUILT_IN_JAVASCRIPT_PROGRAMS } from "@/lib/built-in-javascript-programs";

export type BuiltInProgram = {
  path: string;
  title: string;
  kind: "java";
  text: string;
};

const COLLECTION_ROOT = "built-in/collection";

const BUILT_IN_COLLECTION_PROGRAMS: BuiltInProgram[] = [
  {
    path: `${COLLECTION_ROOT}/ArrayListAddUpdateRemoveIterate.java`,
    title: "ArrayList add, update, remove, and iterate",
    kind: "java",
    text: `import java.util.ArrayList;
import java.util.List;

public class ArrayListAddUpdateRemoveIterate {
    public static void main(String[] args) {
        List<String> tools = new ArrayList<>();
        tools.add("Selenium");
        tools.add("Postman");
        tools.add("JMeter");

        tools.set(1, "Playwright");
        tools.remove("JMeter");

        for (String tool : tools) {
            System.out.println(tool);
        }
    }
}

// Output:
// Selenium
// Playwright`,
  },
  {
    path: `${COLLECTION_ROOT}/RemoveDuplicatesUsingLinkedHashSet.java`,
    title: "Remove duplicates from a List using LinkedHashSet",
    kind: "java",
    text: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;

public class RemoveDuplicatesUsingLinkedHashSet {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(4, 2, 4, 1, 2, 5);

        List<Integer> unique =
                new ArrayList<>(new LinkedHashSet<>(numbers));

        System.out.println(unique);
    }
}

// Output: [4, 2, 1, 5]
// LinkedHashSet removes duplicates and keeps insertion order.`,
  },
  {
    path: `${COLLECTION_ROOT}/ElementFrequencyUsingHashMap.java`,
    title: "Count element frequency using HashMap",
    kind: "java",
    text: `import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ElementFrequencyUsingHashMap {
    public static void main(String[] args) {
        List<String> words =
                Arrays.asList("api", "ui", "api", "mobile", "ui", "api");

        Map<String, Integer> frequency = new LinkedHashMap<>();

        for (String word : words) {
            frequency.put(word, frequency.getOrDefault(word, 0) + 1);
        }

        System.out.println(frequency);
    }
}

// Output: {api=3, ui=2, mobile=1}
// LinkedHashMap keeps the first-seen order.`,
  },
  {
    path: `${COLLECTION_ROOT}/FirstNonRepeatedCharacterUsingLinkedHashMap.java`,
    title: "Find the first non-repeated character using LinkedHashMap",
    kind: "java",
    text: `import java.util.LinkedHashMap;
import java.util.Map;

public class FirstNonRepeatedCharacterUsingLinkedHashMap {
    public static void main(String[] args) {
        String value = "swiss";
        Map<Character, Integer> frequency = new LinkedHashMap<>();

        for (char ch : value.toCharArray()) {
            frequency.put(ch, frequency.getOrDefault(ch, 0) + 1);
        }

        for (Map.Entry<Character, Integer> entry : frequency.entrySet()) {
            if (entry.getValue() == 1) {
                System.out.println(entry.getKey());
                break;
            }
        }
    }
}

// Output: w`,
  },
  {
    path: `${COLLECTION_ROOT}/SortArrayList.java`,
    title: "Sort an ArrayList in ascending and descending order",
    kind: "java",
    text: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class SortArrayList {
    public static void main(String[] args) {
        List<Integer> numbers =
                new ArrayList<>(Arrays.asList(7, 2, 9, 1));

        Collections.sort(numbers);
        System.out.println("Ascending: " + numbers);

        numbers.sort(Collections.reverseOrder());
        System.out.println("Descending: " + numbers);
    }
}

// Output:
// Ascending: [1, 2, 7, 9]
// Descending: [9, 7, 2, 1]`,
  },
  {
    path: `${COLLECTION_ROOT}/SortHashMapByValue.java`,
    title: "Sort HashMap entries by value",
    kind: "java",
    text: `import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class SortHashMapByValue {
    public static void main(String[] args) {
        Map<String, Integer> scores = new LinkedHashMap<>();
        scores.put("API", 82);
        scores.put("UI", 95);
        scores.put("Mobile", 88);

        Map<String, Integer> sorted = scores.entrySet()
                .stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (oldValue, newValue) -> oldValue,
                        LinkedHashMap::new
                ));

        System.out.println(sorted);
    }
}

// Output: {UI=95, Mobile=88, API=82}`,
  },
];

export const BUILT_IN_PROGRAMS: BuiltInProgram[] = [
  ...BUILT_IN_COLLECTION_PROGRAMS,
  ...BUILT_IN_JAVASCRIPT_PROGRAMS,
];

export function builtInProgram(path: string): BuiltInProgram | undefined {
  return BUILT_IN_PROGRAMS.find((program) => program.path === path);
}

export function isBuiltInProgram(path: string): boolean {
  return path.startsWith("built-in/");
}
