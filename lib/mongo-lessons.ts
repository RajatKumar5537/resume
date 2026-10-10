import type { ConceptGroupId, ConceptLesson } from "./concepts";

const BASIS = "Prepared interview explanation. It is not a quotation from the saved SQL PDF.";
const SQL = "Interview_PDF/SQL.pdf";

export const MONGO_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "mg-fundamentals", title: "MongoDB Fundamentals" },
  { id: "mg-filter", title: "Searching and Filtering" },
  { id: "mg-crud", title: "CRUD Operations" },
  { id: "mg-aggregation", title: "Aggregation" },
  { id: "mg-qa", title: "MongoDB for QA and SDET" },
];

export const MONGO_PATHS = [SQL];

function sql(page: string, focus: string): ConceptLesson["sources"] {
  return [{ label: `S- SQL.pdf, ${page}`, path: SQL, kind: "pdf", focus }];
}

const SAMPLE = "Illustrative users collection. These ObjectIds are examples, not live records.";

export const MONGO_CONCEPTS: ConceptLesson[] = [
  {
    id: "mg-what",
    group: "mg-fundamentals",
    title: "What is MongoDB?",
    aliases: ["what is mongodb", "mongodb"],
    basis: BASIS,
    summary:
      "MongoDB is a document database. Data lives in collections of JSON-like documents, so a user record can hold nested fields and arrays. I use it in testing to read the document an API wrote, not to replace the API test.",
    simple:
      "A relational database stores rows in tables. MongoDB stores documents in collections. One user document can contain skills and a profile object.",
    points: [
      "The usual hierarchy is database, collection, document, field.",
      "A document does not have to match the shape of the next document. That flexibility is also a source of missing fields.",
      "These lessons use mongosh query syntax. Compass uses the same filter, without the db.users.find wrapper.",
    ],
    example: {
      code: `// ${SAMPLE}
{
  _id: ObjectId("65a000000000000000000001"),
  name: "Amit",
  email: "amit@example.com",
  age: 28,
  status: "active",
  city: "Delhi",
  skills: ["Java", "Selenium"],
  profile: { department: "QA", experience: 5 }
}`,
      output: "This is the sample Amit document used in the later queries. It was not inserted into a database.",
    },
    sources: [],
    related: ["mg-vs-sql", "mg-structure", "mg-bson"],
  },
  {
    id: "mg-vs-sql",
    group: "mg-fundamentals",
    title: "What is the difference between SQL and MongoDB?",
    aliases: ["sql and mongodb", "sql vs mongodb", "mongodb vs sql"],
    basis: BASIS,
    summary:
      "SQL talks to tables of rows. MongoDB talks to collections of documents. A find filter is the closest idea to SELECT WHERE, and $group is the closest idea to GROUP BY. They are not copies of each other. A join, a transaction, and a constraint do not move across unchanged.",
    simple:
      "I translate the goal, then I write the MongoDB query. I do not paste a SQL statement into mongosh.",
    points: [
      "The SQL note defines SQL as the language for create, read, update, and delete in a relational database.",
      "A table compares to a collection, a row to a document, and a column to a field.",
      "The SQL note’s primary key identifies one row. MongoDB’s _id identifies one document. A business key such as email still needs its own unique index.",
      "The SQL note’s foreign key is enforced by the database. MongoDB can store a reference, or embed the related data, without that same automatic check.",
      "The SQL note normalizes to reduce duplicate data. MongoDB often embeds a small profile instead. Embedding is a choice, not a broken normal form.",
    ],
    table: {
      title: "Conceptual comparison",
      headers: ["Idea", "SQL", "MongoDB"],
      rows: [
        ["Stored unit", "Row in a table", "Document in a collection"],
        ["Read with a condition", "SELECT ... WHERE", "find() with a filter"],
        ["Chosen fields", "Selected columns", "Projection"],
        ["Order and page", "ORDER BY and LIMIT", "sort(), skip(), and limit()"],
        ["Summaries", "GROUP BY", "$group in an aggregation"],
        ["Combine tables", "JOIN", "$lookup, or embed the data"],
      ],
    },
    how: "This table is a map for interviews. $lookup does not reproduce every JOIN in the SQL note. deleteMany is not TRUNCATE. Those differences are in the later lessons.",
    sources: sql("page 1", "What is SQL"),
    related: ["mg-what", "mg-lookup", "mg-id"],
  },
  {
    id: "mg-structure",
    group: "mg-fundamentals",
    title: "What are databases, collections, and documents?",
    aliases: ["collection and document", "mongodb database"],
    basis: BASIS,
    summary:
      "A database is a container. A collection is a set of documents, similar in role to a table but not required to share one schema. A document is one record, stored as field and value pairs.",
    simple:
      "practice is the database, users is the collection, and Amit’s record is one document. A second user can omit city. The collection still accepts it.",
    points: [
      "use practice switches the current database in mongosh. It does not create the database until data is written.",
      "db.users is the collection. The name is case-sensitive.",
      "Fields inside one document can be strings, numbers, arrays, or objects.",
      "Two documents in users can have different fields. A query on a missing field does not throw. It simply does not match.",
    ],
    sources: [],
    related: ["mg-what", "mg-bson", "mg-null"],
  },
  {
    id: "mg-bson",
    group: "mg-fundamentals",
    title: "What is BSON, and how is it different from JSON?",
    aliases: ["bson", "bson and json"],
    basis: BASIS,
    summary:
      "JSON is the text format APIs usually send. BSON is the binary format MongoDB stores. BSON adds types JSON does not have, especially ObjectId and Date. A string that looks like an id is not the same type as an ObjectId.",
    simple:
      "The API can show \"65a000000000000000000001\" in quotes. The stored _id may be an ObjectId. The characters match and the query still misses.",
    points: [
      "JSON numbers and strings have no ObjectId type.",
      "A JSON date is usually a string. A BSON Date is a date type. They do not match each other.",
      "Numeric values of the same amount generally match across MongoDB number types. ObjectId and string do not.",
      "I compare the type when a value looks right and the query returns nothing.",
    ],
    sources: [],
    related: ["mg-id", "mg-qa-read", "mg-null"],
  },
  {
    id: "mg-id",
    group: "mg-fundamentals",
    title: "What is the _id field in MongoDB?",
    aliases: ["objectid", "_id", "mongodb id"],
    basis: BASIS,
    summary:
      "_id is the unique identity of a document. If I do not supply one, MongoDB creates an ObjectId. It is the closest idea to the SQL note’s primary key, and it is not a substitute for a business key such as email.",
    simple:
      "Two Amit documents can share a name. They cannot share an _id. Email can still be duplicated until a unique index says otherwise.",
    points: [
      "ObjectId(\"65a000000000000000000001\") is 24 hex characters.",
      "_id is immutable in normal use. Changing a user’s email does not change _id.",
      "The SQL note’s primary key can be one column or several. _id is a single field, though that field’s value can be a string or a number you chose.",
      "An API that returns the id as a string must be queried with the same type the collection stores.",
    ],
    example: {
      code: `db.users.findOne({
  _id: ObjectId("65a000000000000000000001")
})`,
      output: "Returns the illustrative Amit document, or null if the stored _id is a string instead of an ObjectId. This query was not executed.",
    },
    how: "The SQL note says a primary key prevents duplicate rows and identifies each record. _id does that for documents. Referential integrity from the foreign-key paragraph is not automatic for a field that merely holds another document’s id.",
    sources: sql("page 1", "primary key"),
    related: ["mg-vs-sql", "mg-bson", "mg-qa-read"],
  },
  {
    id: "mg-connect",
    group: "mg-fundamentals",
    title: "How do you connect with Compass and mongosh?",
    aliases: ["mongodb compass", "mongosh", "connect to mongodb"],
    basis: BASIS,
    summary:
      "Compass is the visual client. mongosh is the shell where these lessons’ commands run. Both need a connection string, a database, and a collection. I use a local or test database for practice, never a shared production string in notes.",
    simple:
      "In Compass I open the users collection and paste the filter. In mongosh I type db.users.find with that same filter.",
    points: [
      "A local practice command looks like mongosh \"mongodb://localhost:27017/practice\". That host is an example, not a credential.",
      "Compass filter bar wants { status: \"active\" }, not the full db.users.find call.",
      "show dbs and show collections tell me whether I am in the database the API uses.",
      "The same query in the wrong database is a common reason a record looks missing.",
    ],
    example: {
      code: `mongosh "mongodb://localhost:27017/practice"
show collections
db.users.find({ email: "amit@example.com" })`,
      output: "These commands were not run. The connection string has no username or password. Point it only at a database you are allowed to read.",
    },
    sources: [],
    related: ["mg-find", "mg-safety", "mg-structure"],
  },
  {
    id: "mg-find",
    group: "mg-filter",
    title: "How do you find documents, and how is findOne different from find?",
    aliases: ["find all documents", "findone", "find by email"],
    basis: BASIS,
    summary:
      "find returns a cursor of every match. findOne returns the first match or null. An empty filter reads the collection. A field filter reads the documents where that field equals the value.",
    simple:
      "find is the list. findOne is one document. I use findOne when the API gave me one id or one email.",
    points: [
      "In mongosh, find() prints a cursor, usually the first batch. It is not a single document.",
      "findOne returns null when nothing matches. It does not throw.",
      "If several documents match, findOne still returns only one, and without sort that one is not a promise of which one.",
      `${SAMPLE}`,
    ],
    example: {
      code: `db.users.find({})

db.users.find({ email: "amit@example.com" })

db.users.findOne({ email: "amit@example.com" })`,
      output:
        "The first call lists the illustrative users. The second lists every document with Amit’s email. The third returns one document or null. These queries were not executed.",
    },
    sources: [],
    related: ["mg-and", "mg-project", "mg-qa-read"],
  },
  {
    id: "mg-and",
    group: "mg-filter",
    title: "How do you filter documents with multiple conditions?",
    aliases: ["multiple conditions", "active users in delhi", "implicit and"],
    basis: BASIS,
    summary:
      "Two fields in the same filter are combined with AND. The document must match every field. I use $or only when one match is enough, and $and when I need two conditions on the same field.",
    simple:
      "status active and city Delhi means both. A Delhi user who is inactive stays out.",
    points: [
      "The order of fields in the filter does not change the matches.",
      "A wrong value type fails quietly. status: \"Active\" does not match status: \"active\".",
      "AND is the default. Writing $and around simple fields is optional.",
    ],
    example: {
      code: `db.users.find({
  status: "active",
  city: "Delhi"
})`,
      output: "On the sample data, Amit matches. An inactive Delhi user would not. This query was not executed.",
    },
    sources: [],
    related: ["mg-logic", "mg-compare", "mg-find"],
  },
  {
    id: "mg-compare",
    group: "mg-filter",
    title: "How do you use $gt, $gte, $lt, and $lte?",
    aliases: ["greater than", "less than", "$gte", "comparison operators"],
    basis: BASIS,
    summary:
      "$gt is greater than, $gte is greater than or equal, $lt is less than, and $lte is less than or equal. They sit inside the field. The field’s type must be comparable. A number does not compare usefully with a numeric string.",
    simple:
      "age greater than 25 keeps 28 and drops 24. Greater than or equal would also keep 25.",
    points: [
      "Put the operator under the field: { age: { $gt: 25 } }.",
      "{ $gt: 25 } alone is not a filter.",
      "Dates compare as dates only when the stored value is a Date.",
      "These operators do not include documents where the field is missing.",
    ],
    example: {
      code: `db.users.find({
  age: { $gt: 25 }
})`,
      output: "Amit, age 28, matches. A sample user aged 24 does not. Equal to 25 would need $gte. This query was not executed.",
    },
    sources: [],
    related: ["mg-and", "mg-in", "mg-null"],
  },
  {
    id: "mg-in",
    group: "mg-filter",
    title: "How do you use $in and $nin?",
    aliases: ["in operator", "nin", "match any value"],
    basis: BASIS,
    summary:
      "$in matches a field whose value is any member of a list. $nin matches when the value is outside that list. $in is for a single field with several accepted values, not for several different fields.",
    simple:
      "City Delhi or Mumbai is $in. City not in that pair is $nin. $nin also matches documents where city is missing.",
    points: [
      "The list is an array: { city: { $in: [\"Delhi\", \"Mumbai\"] } }.",
      "For different fields, use $or. $in cannot say city Delhi or status active.",
      "$nin on a large collection can be slower than an allowed-value list. For a QA check, correctness comes first.",
    ],
    example: {
      code: `db.users.find({
  city: { $in: ["Delhi", "Mumbai"] }
})`,
      output: "Amit in Delhi matches. A user in Jaipur does not. This query was not executed.",
    },
    sources: [],
    related: ["mg-logic", "mg-compare", "mg-nested"],
  },
  {
    id: "mg-logic",
    group: "mg-filter",
    title: "How do you use $and, $or, and $not?",
    aliases: ["or operator", "and operator", "not operator"],
    basis: BASIS,
    summary:
      "$or matches when any listed condition is true. $and matches when every listed condition is true. $not negates one operator on one field. $not is not wrapped around a whole document.",
    simple:
      "Delhi or active is wider than Delhi and active. $not on age greater than 25 keeps the younger users and also users with no age.",
    points: [
      "$or and $and take an array of filters.",
      "Use $and when the same field needs two operators, such as age at least 18 and age below 30.",
      "The form is { age: { $not: { $gt: 25 } } }. { $not: { age: { $gt: 25 } } } is not valid.",
      "$ne is the simple not-equal. It also matches a missing field.",
    ],
    example: {
      code: `db.users.find({
  $or: [
    { city: "Delhi" },
    { status: "active" }
  ]
})`,
      output: "Amit matches both sides. An inactive Mumbai user would not. This query was not executed.",
    },
    sources: [],
    related: ["mg-and", "mg-in", "mg-null"],
  },
  {
    id: "mg-null",
    group: "mg-filter",
    title: "How do you search for missing, null, or existing fields?",
    aliases: ["missing field", "null field", "exists"],
    basis: BASIS,
    summary:
      "A missing field and a field set to null are different. { status: null } matches both. { status: { $exists: false } } matches only a missing field. { status: { $type: \"null\" } } matches only an explicit null.",
    simple:
      "No city key is not the same as city: null, and neither is the same as city: \"\". I pick the query for the case the API actually wrote.",
    points: [
      "$exists: true means the key is present, even when the value is null.",
      "An empty string is a present string. It is not null and it is not missing.",
      "An empty array is a present array. { skills: [] } matches that exact value. { skills: { $size: 0 } } also matches an empty array.",
      "{ status: { $ne: \"active\" } } includes missing status. That surprises people during a count check.",
    ],
    example: {
      code: `db.users.find({ city: { $exists: false } })
db.users.find({ status: { $type: "null" } })
db.users.find({ city: "" })
db.users.find({ skills: { $size: 0 } })`,
      output:
        "Each query targets a different shape. { status: null } would mix explicit null with a missing status, so it is not the precise check. These queries were not executed.",
    },
    sources: [],
    related: ["mg-qa-shape", "mg-bson", "mg-and"],
  },
  {
    id: "mg-regex",
    group: "mg-filter",
    title: "How do you search strings with a regular expression?",
    aliases: ["regex", "regular expression", "partial name"],
    basis: BASIS,
    summary:
      "A regex matches a string pattern. I anchor it when I know the start or the end. An unanchored search scans more widely and can ignore a useful index. Regex is case-sensitive unless I set the i option.",
    simple:
      "Amit matches ^Amit. amit does not, until I ignore case. The pattern is for strings, not for ObjectId or numbers.",
    points: [
      "{ name: { $regex: \"^Amit\", $options: \"i\" } } is the explicit form.",
      "{ name: /^Amit/ } is the shell shorthand.",
      "A dot is special. Escape it when the search text is an email or a file name.",
      "I do not use a leading wildcard as the default QA lookup. Equality or an anchored prefix is easier to explain.",
    ],
    example: {
      code: `db.users.find({
  name: { $regex: "^Amit", $options: "i" }
})`,
      output: "Names starting with Amit, any case, match. A name that only contains Amit later does not, because of the caret. This query was not executed.",
    },
    sources: [],
    related: ["mg-find", "mg-nested", "mg-index"],
  },
  {
    id: "mg-nested",
    group: "mg-filter",
    title: "How do you search nested fields and array values?",
    aliases: ["nested field", "array value", "profile.department"],
    basis: BASIS,
    summary:
      "A nested field uses dot notation in quotes. An array field matches when the array contains the value. Matching the whole array is a different, stricter query.",
    simple:
      "profile.department QA finds Amit. skills Selenium finds him because Selenium is one element, not because the whole array equals that word.",
    points: [
      "The quotes are required: \"profile.department\".",
      "{ skills: \"Selenium\" } means the array contains that element.",
      "{ skills: [\"Java\", \"Selenium\"] } means the array is exactly those values in that order.",
      "{ skills: { $all: [\"Java\", \"Selenium\"] } } means both are present, in any order, with extra skills allowed.",
      "An API can show department at the top while MongoDB stores profile.department. I query the stored path.",
    ],
    example: {
      code: `db.users.find({
  "profile.department": "QA"
})

db.users.find({
  skills: "Selenium"
})`,
      output: "Both queries match the illustrative Amit document. A developer with only Java would match neither skills query. These queries were not executed.",
    },
    sources: [],
    related: ["mg-qa-shape", "mg-project", "mg-and"],
  },
  {
    id: "mg-insert",
    group: "mg-crud",
    title: "How do you insert one or many documents?",
    aliases: ["insertone", "insertmany", "insert documents"],
    basis: BASIS,
    summary:
      "insertOne adds one document. insertMany adds a list. MongoDB adds _id when it is absent. A duplicate _id fails that insert. I use a practice collection, not a shared test collection, for these examples.",
    simple:
      "Insert is how a test setup creates Amit. After it, findOne by email should return that document.",
    points: [
      "insertMany stops or continues on error depending on ordered. The default ordered behavior stops at the first error.",
      "A unique email index rejects the second insert with the same email.",
      "The shell result reports acknowledged and insertedId. That is the write result, not the document.",
    ],
    example: {
      code: `db.users.insertOne({
  name: "Amit",
  email: "amit@example.com",
  age: 28,
  status: "active",
  city: "Delhi",
  skills: ["Java", "Selenium"],
  profile: { department: "QA", experience: 5 }
})`,
      output: "A successful result contains insertedId. This insert was not executed. Run it only in a practice database.",
    },
    sources: [],
    related: ["mg-find", "mg-id", "mg-safety"],
  },
  {
    id: "mg-update",
    group: "mg-crud",
    title: "How do you update one or many documents?",
    aliases: ["updateone", "updatemany", "update a document"],
    basis: BASIS,
    summary:
      "updateOne changes the first document that matches the filter. updateMany changes every match. A $set changes only the named fields. A replacement document without an operator deletes the other fields.",
    simple:
      "I find the email first. Then I set status to inactive. I do not send a whole new document unless I mean to replace it.",
    points: [
      "matchedCount tells me the filter found a document. modifiedCount tells me a value actually changed.",
      "Setting the same status again can return matchedCount 1 and modifiedCount 0.",
      "Without $set, the second argument replaces the document. _id stays. Other fields disappear.",
      "Check the filter with find before updateMany.",
    ],
    example: {
      code: `db.users.find({ email: "amit@example.com" })

db.users.updateOne(
  { email: "amit@example.com" },
  { $set: { status: "inactive" } }
)`,
      output:
        "The find shows the current document. The update changes status and leaves name, email, skills, and profile in place. It was not executed.",
    },
    sources: [],
    related: ["mg-operators", "mg-upsert", "mg-qa-update"],
  },
  {
    id: "mg-operators",
    group: "mg-crud",
    title: "What is the difference between $set, $unset, and $inc?",
    aliases: ["unset", "increment", "set versus unset"],
    basis: BASIS,
    summary:
      "$set writes a value. $unset removes the field. $inc adds a number to a numeric field. Removing a field is not the same as setting it to null, and incrementing a missing number starts from zero.",
    simple:
      "Set status. Unset city if the key should disappear. Increment experience by 1. I do not use $inc on a string.",
    points: [
      "$unset: { city: \"\" } removes city. The empty string is ignored as the value.",
      "After $unset, $exists: false matches that field.",
      "$set: { city: null } leaves the key present with null.",
      "$inc: { \"profile.experience\": 1 } changes the nested number.",
    ],
    example: {
      code: `db.users.updateOne(
  { email: "amit@example.com" },
  { $unset: { city: "" } }
)

db.users.updateOne(
  { email: "amit@example.com" },
  { $inc: { "profile.experience": 1 } }
)`,
      output: "The first update deletes the city key. The second moves experience from 5 to 6 on the sample. These updates were not executed.",
    },
    sources: [],
    related: ["mg-update", "mg-null", "mg-qa-update"],
  },
  {
    id: "mg-upsert",
    group: "mg-crud",
    title: "How do you use updateOne with upsert?",
    aliases: ["upsert", "update or insert"],
    basis: BASIS,
    summary:
      "upsert: true updates the match, or inserts a document when nothing matches. The new document combines the filter fields and the update. I use it only when creating a missing row is acceptable.",
    simple:
      "If Amit exists, status changes. If Amit does not exist, a new document is created. That second outcome is easy to miss in a test.",
    points: [
      "The option is the third argument: { upsert: true }.",
      "Use $setOnInsert for fields that should be written only when the document is created.",
      "A broad filter plus upsert can insert a document you did not intend. Find the filter first.",
      "The result’s upsertedCount is 1 when an insert happened.",
    ],
    example: {
      code: `db.users.updateOne(
  { email: "amit@example.com" },
  { $set: { status: "active" }, $setOnInsert: { name: "Amit" } },
  { upsert: true }
)`,
      output:
        "An existing Amit is updated. A missing Amit is inserted with that email, status, and name. This was not executed.",
    },
    sources: [],
    related: ["mg-update", "mg-insert", "mg-safety"],
  },
  {
    id: "mg-delete",
    group: "mg-crud",
    title: "What is the difference between deleteOne, deleteMany, and dropping a collection?",
    aliases: ["deleteone", "deletemany", "drop collection"],
    basis: BASIS,
    summary:
      "deleteOne removes one matching document. deleteMany removes every match. drop removes the whole collection, including its indexes. deleteMany with an empty filter empties the collection and is not a practice command.",
    simple:
      "I delete Amit by email only after find shows that the filter is exactly Amit. I do not drop users to remove one person.",
    points: [
      "The SQL note says DELETE removes rows by a condition and can be rolled back. A MongoDB delete is not automatically reversible. A transaction can change that, and these lessons do not assume one.",
      "The SQL note says TRUNCATE removes all rows and cannot be rolled back. deleteMany({}) removes all documents, and the collection remains. It is still dangerous. It is not a command to try on shared data.",
      "The SQL note says DROP deletes the table. drop() deletes the collection.",
      "deleteOne deletes one match even if the filter matches many. Sort is not part of deleteOne. Make the filter unique.",
    ],
    how: "I keep the SQL words for the interview comparison and use the MongoDB commands for the work. Verify the filter with find. Prefer one explicit _id or email.",
    example: {
      code: `db.users.find({ email: "amit@example.com" })

db.users.deleteOne({ email: "amit@example.com" })`,
      output:
        "find must show the one intended document. deleteOne then removes it. deletedCount is 1 when that happens. This was not executed. Do not use deleteMany({}).",
    },
    sources: sql("page 1", "DELETE"),
    related: ["mg-safety", "mg-qa-delete", "mg-find"],
  },
  {
    id: "mg-page",
    group: "mg-crud",
    title: "How do you sort, limit, skip, and paginate results?",
    aliases: ["sort and limit", "pagination", "skip"],
    basis: BASIS,
    summary:
      "sort orders the cursor, limit keeps the first n of that order, and skip jumps ahead. A stable page needs a sort that breaks ties, usually the business field plus _id.",
    simple:
      "Page size 5, page 1, is skip 0 and limit 5. Page 2 is skip 5. Without a tie-breaker, two equal ages can trade places between calls.",
    points: [
      "sort({ age: -1 }) is descending. sort({ age: 1 }) is ascending.",
      "skip grows slower as the offset grows. It is fine for a small QA sample and a weak plan for huge pages.",
      "The API and the database must use the same sort, or the page comparison is noise.",
      "limit without sort returns an undefined slice of matches.",
    ],
    example: {
      code: `db.users.find({})
  .sort({ age: -1, _id: 1 })
  .skip(0)
  .limit(5)`,
      output: "Up to five illustrative users, oldest first. Equal ages stay ordered by _id. This query was not executed.",
    },
    sources: [],
    related: ["mg-project", "mg-qa-page", "mg-find"],
  },
  {
    id: "mg-project",
    group: "mg-crud",
    title: "How do you return only the required fields?",
    aliases: ["projection", "include fields", "exclude _id"],
    basis: BASIS,
    summary:
      "A projection is the second argument to find. 1 includes a field. 0 excludes it. I include the fields I want to compare, and I exclude _id when the API comparison does not use it.",
    simple:
      "The filter decides which users. The projection decides which fields come back. It does not change the stored document.",
    points: [
      "Inclusion and exclusion cannot be mixed, except _id can be excluded from an inclusion projection.",
      "{ name: 1, email: 1, _id: 0 } returns those two fields.",
      "A dotted path projects a nested field: { \"profile.department\": 1, _id: 0 }.",
      "The SQL idea of selected columns is the projection. The filter is still the WHERE idea.",
    ],
    example: {
      code: `db.users.find(
  { status: "active" },
  { name: 1, email: 1, _id: 0 }
)`,
      output: "Active users return name and email only. Amit qualifies on the sample. This query was not executed.",
    },
    sources: [],
    related: ["mg-find", "mg-nested", "mg-qa-update"],
  },
  {
    id: "mg-pipeline",
    group: "mg-aggregation",
    title: "What is an aggregation pipeline?",
    aliases: ["aggregation pipeline", "group by status", "match project group"],
    basis: BASIS,
    summary:
      "An aggregation pipeline passes documents through stages in order. $match filters, $project reshapes, $group summarizes, $sort orders, and $limit keeps the first rows of that order. Later stages see only what earlier stages produced.",
    simple:
      "find is one filter. A pipeline is a small assembly line. I can filter, then group, then sort the groups.",
    points: [
      "$group’s _id is the group key. _id: \"$status\" groups by the status field. The dollar sign reads the field.",
      "totalUsers: { $sum: 1 } counts documents in the group.",
      "$sort: { totalUsers: -1 } orders those group rows, not the original users.",
      "The SQL note’s WHERE filters before grouping. A $match before $group does that job. HAVING filters after grouping. A $match after $group does that job.",
      "The SQL note’s GROUP BY example counts employees by department. The pipeline below counts users by status. Same idea, different syntax.",
    ],
    example: {
      code: `db.users.aggregate([
  { $match: { age: { $gte: 18 } } },
  {
    $group: {
      _id: "$status",
      totalUsers: { $sum: 1 }
    }
  },
  { $sort: { totalUsers: -1 } },
  { $limit: 10 }
])`,
      output:
        "Each output row is a status and a count, largest count first, at most 10 rows. It is not a list of users. This pipeline was not executed.",
    },
    how: "$project would sit where I need to rename or drop fields, often after $match and before or after $group. $limit after $sort keeps the top groups. $limit before $group would count only an arbitrary subset.",
    sources: sql("page 2", "GROUP BY"),
    related: ["mg-count", "mg-lookup", "mg-vs-sql"],
  },
  {
    id: "mg-count",
    group: "mg-aggregation",
    title: "How do you count documents that match a condition?",
    aliases: ["countdocuments", "count documents", "count active users"],
    basis: BASIS,
    summary:
      "countDocuments returns a number for a filter. I use it to compare an API total with the database. A group stage is the count when I need one number per status instead of one number for the whole filter.",
    simple:
      "countDocuments answers how many. It does not return the users. The filter is the same object I would pass to find.",
    points: [
      "countDocuments({ status: \"active\" }) is the accurate filtered count.",
      "An empty filter counts the whole collection. On a large shared collection I keep the filter.",
      "estimatedDocumentCount is a fast estimate of the whole collection. I do not use it to verify an API total.",
      "The older count() method is not the one I teach.",
    ],
    example: {
      code: `db.users.countDocuments({
  status: "active"
})`,
      output: "The result is a number. On a sample with one active Amit, the number is 1. This count was not executed.",
    },
    sources: [],
    related: ["mg-pipeline", "mg-qa-page", "mg-find"],
  },
  {
    id: "mg-duplicates",
    group: "mg-aggregation",
    title: "How do you find duplicate values in a collection?",
    aliases: ["duplicate email", "find duplicates", "duplicate records"],
    basis: BASIS,
    summary:
      "I group by the business key, count the group, and keep groups whose count is greater than one. Duplicate _id values cannot exist. Duplicate emails can, until a unique index rejects them.",
    simple:
      "Two documents with the same email and different _id values are duplicates for the business, even though MongoDB treats them as two documents.",
    points: [
      "Group on $email, or on the external id the API uses.",
      "$push: \"$_id\" keeps the document ids for the bug report.",
      "$match after $group is the HAVING step: keep count greater than 1.",
      "A unique index prevents new duplicates. It does not delete the ones already stored.",
    ],
    example: {
      code: `db.users.aggregate([
  {
    $group: {
      _id: "$email",
      count: { $sum: 1 },
      ids: { $push: "$_id" }
    }
  },
  { $match: { count: { $gt: 1 } } }
])`,
      output:
        "Each result is an email, a count above 1, and the _id values. No rows means no duplicate email in that collection. This pipeline was not executed.",
    },
    questions: [
      {
        prompt: "How do you check duplicate records for an email or an external id?",
        short: "Group by that field, keep counts greater than 1, and attach the ids to the defect.",
        detail: "If the API creates a second user for the same email, this pipeline shows both _id values. Then I compare created times and status. I do not delete either document in a shared environment.",
      },
    ],
    sources: [],
    related: ["mg-pipeline", "mg-index", "mg-qa-shape"],
  },
  {
    id: "mg-lookup",
    group: "mg-aggregation",
    title: "What is $lookup?",
    aliases: ["lookup", "$lookup", "combine collections"],
    basis: BASIS,
    summary:
      "$lookup pulls matching documents from another collection into an array. It is the aggregation stage most like a left join: local documents remain even when the other side is empty. It is not a right join or a full outer join.",
    simple:
      "Orders stay in the result. The user array is filled when the email matches and empty when it does not. Embedding profile inside the user removes the need for this lookup.",
    points: [
      "The SQL note’s INNER JOIN keeps only matching rows. A $lookup plus a later match on a non-empty array is the closer inner-join idea.",
      "LEFT JOIN keeps the left rows and uses null on the right when needed. $lookup keeps the local documents and uses an empty array.",
      "RIGHT JOIN and FULL JOIN are in the SQL note. $lookup does not provide those by itself.",
      "from, localField, foreignField, and as are the basic keys. as is the new array field.",
    ],
    example: {
      code: `db.orders.aggregate([
  { $match: { userEmail: "amit@example.com" } },
  {
    $lookup: {
      from: "users",
      localField: "userEmail",
      foreignField: "email",
      as: "user"
    }
  }
])`,
      output:
        "Each illustrative order for that email comes back with a user array. An unknown email still returns the order and an empty user array. This pipeline was not executed.",
    },
    sources: sql("page 1", "INNER JOIN"),
    related: ["mg-vs-sql", "mg-pipeline", "mg-nested"],
  },
  {
    id: "mg-qa-read",
    group: "mg-qa",
    title: "How do you find the MongoDB document for an API user id?",
    aliases: ["api user id", "find user from api", "validate api against mongodb"],
    basis: BASIS,
    summary:
      "I take the id from the response and look up that _id in the database the API uses. If the types differ, I also try the business key. Then I compare the fields the test cares about, not the whole JSON serialization.",
    simple:
      "The response id is a clue. The database name, the collection, and the id type decide whether the clue finds a document.",
    points: [
      "Confirm the environment. A staging response will not be in the production database.",
      "Try ObjectId only when the stored _id is an ObjectId. A string _id must be queried as a string.",
      "Project the fields named in the assertion so a large document is easier to compare.",
      "A count of the API list is countDocuments with the same filter, not the length of one page.",
    ],
    example: {
      code: `db.users.findOne(
  { _id: ObjectId("65a000000000000000000001") },
  { name: 1, email: 1, status: 1 }
)`,
      output:
        "One illustrative Amit document, or null. Null means the id, the type, the database, or the collection is wrong. This query was not executed.",
    },
    questions: [
      {
        prompt: "How do you compare the number of API records with the database?",
        short: "Use countDocuments with the API’s filter and compare that number with the API total, not with the current page length.",
        detail: "If the API says 20 and the page array has 10, the page size may be 10 and the total may still be right. I compare total with countDocuments. A mismatch then points to a filter, a tenant, or a soft-deleted status.",
      },
    ],
    sources: [],
    related: ["mg-id", "mg-bson", "mg-count"],
  },
  {
    id: "mg-qa-missing",
    group: "mg-qa",
    title: "How do you investigate a success response with no database record?",
    aliases: ["record missing", "success but missing", "ui api database"],
    basis: BASIS,
    summary:
      "I do not stop at the success message. I search by _id and by the business key, in the database and collection named by that environment. Then I check a soft-delete flag, a different collection, and whether the UI is showing a cached row.",
    simple:
      "Success means the API said it finished. It does not by itself prove a document exists where I am looking.",
    points: [
      "findOne by the returned id. If null, find by email or external id.",
      "Check status values such as deleted or inactive. The UI may hide a document the database still has.",
      "Compare the request database with the service configuration for that environment.",
      "A UI value, an API body, and a document can disagree. I record all three in the defect.",
      "I do not insert a repair document in a shared environment to make the test pass.",
    ],
    example: {
      code: `db.users.findOne({ _id: ObjectId("65a000000000000000000001") })
db.users.find({ email: "amit@example.com" })`,
      output:
        "Both empty means I have not found Amit in this collection. The next check is the id type, the database name, and another collection. These queries were not executed.",
    },
    sources: [],
    related: ["mg-qa-read", "mg-null", "mg-connect"],
  },
  {
    id: "mg-qa-update",
    group: "mg-qa",
    title: "How do you validate that an update changed only the intended fields?",
    aliases: ["update api mongodb", "http 200 unchanged", "unrelated fields"],
    basis: BASIS,
    summary:
      "I read the document before and after the call. HTTP 200 is not proof of a write. matchedCount can be zero, modifiedCount can be zero, or a cache can still show the old value. I also compare fields the request did not mention.",
    simple:
      "I want status to change and email to stay. If email changes too, the update replaced more than it should.",
    points: [
      "Save name, email, status, skills, and profile before the call.",
      "After the call, findOne the same _id.",
      "A changed updated time with the same status may mean the API wrote the old value again.",
      "A missing field after the call means the API replaced the document or unset the field.",
      "Replica lag can show the old document for a short time. I retry the read once before filing a data bug.",
    ],
    example: {
      code: `db.users.findOne(
  { email: "amit@example.com" },
  { status: 1, email: 1, city: 1, profile: 1, _id: 0 }
)`,
      output:
        "Compare this read with the same projection from before the API call. Only the intended field should differ. This read was not executed.",
    },
    sources: [],
    related: ["mg-update", "mg-operators", "mg-project"],
  },
  {
    id: "mg-qa-shape",
    group: "mg-qa",
    title: "How do you validate nested API fields and awkward values?",
    aliases: ["nested json", "empty array", "null versus missing"],
    basis: BASIS,
    summary:
      "I map each API field to the stored path, then query that path. Nested department may be profile.department. I test a present value, an explicit null, a missing key, an empty string, and an empty array as different cases.",
    simple:
      "The JSON shape and the document shape do not have to look identical. The test should name the stored path it checked.",
    points: [
      "A root department in the response can be mapped from profile.department.",
      "null, a missing key, \"\", and [] need separate fixtures.",
      "Do not assert that a missing city equals an empty string unless the API contract says it does.",
      "Include one document that has the field and one that does not, or the assertion never sees the difference.",
    ],
    example: {
      code: `db.users.findOne(
  { email: "amit@example.com" },
  { "profile.department": 1, "profile.experience": 1, skills: 1, _id: 0 }
)`,
      output:
        "The sample returns department QA, experience 5, and the skills array. A user without profile would return an empty projection for those paths. This query was not executed.",
    },
    sources: [],
    related: ["mg-nested", "mg-null", "mg-qa-update"],
  },
  {
    id: "mg-qa-page",
    group: "mg-qa",
    title: "How do you validate pagination and sorting against MongoDB?",
    aliases: ["api pagination", "sort order", "page size"],
    basis: BASIS,
    summary:
      "I run the API’s filter with the API’s sort, skip, and limit. The ids and the order should match the page. I add _id as a tie-breaker so equal names do not shuffle.",
    simple:
      "The database page is the expected list. If the API order differs, I check the sort field and whether nulls are sorted first.",
    points: [
      "Page length is not the total. Compare the total with countDocuments.",
      "skip is (page number minus 1) times the page size, when pages start at 1.",
      "A missing sort in the API makes the order unstable. I do not call that a data mismatch until I know the contract.",
      "Ask for the next page and confirm the first id of page 2 is not repeated from page 1.",
    ],
    example: {
      code: `db.users.find({ status: "active" })
  .sort({ name: 1, _id: 1 })
  .skip(0)
  .limit(10)`,
      output:
        "The first 10 active users in name order. Compare these ids with the API page. This query was not executed.",
    },
    sources: [],
    related: ["mg-page", "mg-count", "mg-qa-read"],
  },
  {
    id: "mg-qa-delete",
    group: "mg-qa",
    title: "How do you verify a delete API and a tenant filter?",
    aliases: ["delete api", "tenant filter", "soft delete"],
    basis: BASIS,
    summary:
      "After a delete, findOne on that id should be null for a hard delete. A soft delete leaves the document and changes a status. A tenant filter must be in the query, or I can see another customer’s documents and misread the result.",
    simple:
      "Gone means the document is gone, or the contract’s deleted flag is set. I check which one the API promised. I also check that a second user’s document is still there.",
    points: [
      "Read the document before the call so I know what should disappear.",
      "Hard delete: findOne returns null, and a list filtered by that email is empty.",
      "Soft delete: the document remains and status, or a deleted flag, changed.",
      "A query without tenantId can return another tenant’s Amit. Add the tenant field the test data uses.",
      "Do not deleteMany to clean up a shared database.",
    ],
    example: {
      code: `db.users.findOne({ _id: ObjectId("65a000000000000000000001") })

db.users.find({
  tenantId: "tenant-a",
  email: "amit@example.com"
})`,
      output:
        "After a hard delete, the first query is null. The tenant query must not return another tenant’s user. tenantId is an illustrative field. These queries were not executed.",
    },
    sources: [],
    related: ["mg-delete", "mg-safety", "mg-qa-missing"],
  },
  {
    id: "mg-index",
    group: "mg-qa",
    title: "What is an index, and how does it affect a query?",
    aliases: ["mongodb index", "unique index", "explain"],
    basis: BASIS,
    summary:
      "An index is an extra structure that helps MongoDB find matching documents without scanning the whole collection. The SQL note describes the same goal: fewer disk reads. An index does not change which documents match. A unique index also rejects duplicate values.",
    simple:
      "A query can be correct and slow. The index is about the slow part. The filter still decides the result.",
    points: [
      "The SQL note says an index supports quick retrieval. That purpose carries over. The command does not.",
      "db.users.createIndex({ email: 1 }, { unique: true }) is a schema change. I do not run it on a shared database as a casual check.",
      "explain(\"executionStats\") can show an index scan or a collection scan. I use it to investigate a slow test, not as the first lesson in finding Amit.",
      "A regex without an anchor is a common reason an index is not useful.",
      "An index does not fix a wrong database, a wrong type, or a missing tenant filter.",
    ],
    sources: sql("page 2", "indexing"),
    related: ["mg-duplicates", "mg-regex", "mg-vs-sql"],
  },
  {
    id: "mg-safety",
    group: "mg-qa",
    title: "How do you run queries safely in a shared test environment?",
    aliases: ["shared test database", "safe queries", "read only"],
    basis: BASIS,
    summary:
      "I start with find and countDocuments. I name the database and the filter in the note. I update or delete only a document the test created, and only after find shows that one document. I never run an empty delete against a shared collection.",
    simple:
      "Read is the default. A write needs a filter I have already seen, on data the test owns.",
    points: [
      "show dbs and db.getName() before a write. The prompt can be pointed at the wrong database.",
      "find the filter. If the count is not exactly the rows I mean to change, I stop.",
      "deleteMany({}) and drop() are not cleanup shortcuts.",
      "A production defect is investigated with a read. I do not repair production data from a lesson query.",
      "Passwords, connection strings, and customer documents do not belong in a bug note. Use the id and the field that failed.",
      "These lesson queries were checked for syntax and were not run against a MongoDB server.",
    ],
    sources: [],
    related: ["mg-delete", "mg-connect", "mg-qa-delete"],
  },
];

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function mongoById(id: string): ConceptLesson | undefined {
  return MONGO_CONCEPTS.find((lesson) => lesson.id === id);
}

export function mongoInGroup(group: ConceptGroupId): ConceptLesson[] {
  return MONGO_CONCEPTS.filter((lesson) => lesson.group === group);
}

export function searchMongoLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return MONGO_CONCEPTS.map((lesson) => {
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
