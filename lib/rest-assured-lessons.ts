import type { ConceptGroupId, ConceptLesson } from "./concepts";

const BASIS = "Prepared interview explanation. It is not a quotation from the saved REST Assured PDF.";
const RA = "Interview_PDF/Rest_Assured.pdf";
const EXPLAIN = "Interview_PDF/Explain RestAssured.pdf";

export const REST_GROUPS: { id: ConceptGroupId; title: string }[] = [
  { id: "ra-fundamentals", title: "API Testing Fundamentals" },
  { id: "ra-requests", title: "REST Assured Setup and Requests" },
  { id: "ra-validation", title: "Response Validation and Extraction" },
  { id: "ra-auth", title: "Authentication and Advanced Requests" },
  { id: "ra-sdet", title: "Framework and SDET Scenarios" },
];

export const REST_PATHS = [RA, EXPLAIN];

function ra(page: string, focus: string): ConceptLesson["sources"] {
  return [{ label: `R- Rest_Assured.pdf, ${page}`, path: RA, kind: "pdf", focus }];
}

function explain(page: string, focus: string): ConceptLesson["sources"] {
  return [{ label: `Explain RestAssured.pdf, ${page}`, path: EXPLAIN, kind: "pdf", focus }];
}

const NOT_RUN = "Illustrative example. This request was not executed.";

export const REST_CONCEPTS: ConceptLesson[] = [
  {
    id: "ra-api",
    group: "ra-fundamentals",
    title: "What is an API, and why do we test APIs?",
    aliases: ["what is an api", "why test apis", "api testing"],
    basis: BASIS,
    summary:
      "An API is the contract one program uses to ask another program for data or a change. I test it so the status, body, headers, and side effects are right before the UI is ready, and so a UI-only pass does not hide a bad contract.",
    simple:
      "The UI is one client. A mobile app or another service can call the same API. If the API is wrong, every client is wrong.",
    points: [
      "I check the contract: method, URL, auth, body, status, response shape, and what changed in the database.",
      "API tests can run without a browser, so they are a fast layer under UI tests. They do not replace UI tests.",
      "Performance and security are separate efforts. One REST Assured call does not prove either.",
    ],
    questions: [
      {
        prompt: "When is API testing useful before the UI exists?",
        short: "When the contract is ready and a client can call it.",
        detail: "I can create, read, update, and delete through the API, then the UI test later checks that the screen uses the same contract.",
      },
    ],
    mistakes: ["Calling any HTTP check a security test.", "Skipping the database when the bug is about saved data."],
    sources: [],
    related: ["ra-rest", "ra-what", "ra-status"],
  },
  {
    id: "ra-rest",
    group: "ra-fundamentals",
    title: "What is REST, and what is a RESTful API?",
    aliases: ["what is rest", "restful api", "rest principles"],
    basis: BASIS,
    summary:
      "REST is a style for HTTP APIs. A RESTful API treats users, orders, or products as resources and uses HTTP methods on their URLs. The usual constraints are client-server, stateless, cacheable, a uniform interface, and a layered system.",
    simple:
      "GET /users/1 reads a user. POST /users creates one. The server should not depend on hidden session state from the previous call. Auth is sent with the request, usually as a token.",
    points: [
      "The notes list code-on-demand as optional. Most JSON APIs I test do not send executable code.",
      "A URL that uses HTTP is not automatically REST. The contract still decides resource names, status codes, and whether PUT replaces or PATCH patches.",
      "Stateless means the request carries what the server needs. It does not mean the database has no data.",
    ],
    example: {
      code: `GET /products/123
POST /products
PUT /products/123
DELETE /products/123`,
      output: "These are the resource examples from the notes. They were not called.",
    },
    sources: ra("page 1", "RESTful API"),
    related: ["ra-methods", "ra-what", "ra-parts"],
  },
  {
    id: "ra-what",
    group: "ra-fundamentals",
    title: "What is REST Assured, and how is it different from Postman?",
    aliases: ["what is rest assured", "rest assured", "restassured", "postman vs rest assured"],
    basis: BASIS,
    summary:
      "REST Assured is a Java library for calling HTTP APIs and asserting the response in code. I use Postman to explore a request. I use REST Assured when the check must run with TestNG, in Maven, and in CI, next to the other Java tests.",
    simple:
      "Postman is an application with collections, environments, and scripts. REST Assured is code. Both can send GET or POST and check a status. Only the code version lives in the same repository as the Java suite.",
    points: [
      "The notes say REST Assured gives a readable syntax, supports the common HTTP methods, handles JSON and XML, and works with JUnit and TestNG.",
      "Postman collections can also run in CI through Newman. That is a different tool, not a REST Assured feature.",
      "I do not treat a Postman pass as proof that the Java suite covers the same assertion.",
    ],
    compare: {
      title: "Postman and REST Assured",
      leftLabel: "Postman",
      left: "Interactive client for exploring and sharing requests.",
      rightLabel: "REST Assured",
      right: "Java DSL for automated API checks.",
      rows: [
        { leftLabel: "Where it runs", left: "App, Collection Runner, or Newman", rightLabel: "Where it runs", right: "JUnit or TestNG through Maven" },
        { leftLabel: "Data", left: "Environments and collection variables", rightLabel: "Data", right: "POJOs, builders, and TestNG data providers" },
      ],
    },
    sources: ra("page 1", "RestAssured"),
    related: ["ra-setup", "ra-gwt", "ra-testng"],
  },
  {
    id: "ra-methods",
    group: "ra-fundamentals",
    title: "What are GET, POST, PUT, PATCH, and DELETE?",
    aliases: ["http methods", "put vs patch", "post vs put"],
    basis: BASIS,
    summary:
      "GET reads. POST usually creates. PUT usually replaces a resource. PATCH usually changes only the fields you send. DELETE removes. The API contract can narrow those meanings, so I confirm the expected status and body instead of assuming them.",
    simple:
      "If I send PUT with only a name, a replacement-style API may clear the other fields. PATCH is the method I ask for when only one field should change.",
    points: [
      "GET and DELETE normally use the URL, not a JSON body. Some APIs still accept a body. I follow the contract.",
      "POST is not always 201, and DELETE is not always 204. The notes' sample suite treats DELETE success as an empty body. Public demo APIs often return 200 and an empty object.",
      "PUT and PATCH are not interchangeable just because both can return 200.",
    ],
    table: {
      title: "Methods I expect to explain",
      headers: ["Method", "Usual intent"],
      rows: [
        ["GET", "Read a resource or a collection"],
        ["POST", "Create a resource or start an action"],
        ["PUT", "Replace the resource"],
        ["PATCH", "Change part of the resource"],
        ["DELETE", "Remove the resource"],
      ],
    },
    sources: [...ra("page 1", "DELETE"), ...explain("page 4", "PATCH")],
    related: ["ra-get", "ra-post", "ra-put", "ra-delete"],
  },
  {
    id: "ra-status",
    group: "ra-fundamentals",
    title: "What are the HTTP status codes used in API testing?",
    aliases: ["http status codes", "401 vs 403", "statuscode"],
    basis: BASIS,
    summary:
      "The status code is the first contract check. 2xx means the server accepted the outcome, 4xx means the client request is unacceptable, and 5xx means the server failed. I still read the body, because a 200 can carry an error object.",
    simple:
      "200 is a successful read. 201 means created. 204 means success with no body. 400 is a bad request. 401 means unauthenticated. 403 means authenticated but not allowed. 404 means the resource was not found.",
    points: [
      "401 is not a bad request. 400 is the bad-request code. 403 is not the same as 401.",
      "404 means the server could not find that resource. It does not, by itself, mean the protocol is missing.",
      "415 means the media type is unsupported. 422 means the server understood the body but cannot process it. 409 is a common conflict code for duplicates. The contract names the actual code.",
      "429 means too many requests. 500 is a server error. I log a 500 with the correlation id and do not keep retrying a failed POST.",
    ],
    mistakes: ["Asserting only 200 for every happy path.", "Treating 401 and 403 as the same bug."],
    sources: [],
    related: ["ra-validate", "ra-negative", "ra-auth"],
  },
  {
    id: "ra-parts",
    group: "ra-fundamentals",
    title: "What is the difference between path parameters, query parameters, headers, and a body?",
    aliases: ["path parameters", "query parameters", "request body"],
    basis: BASIS,
    summary:
      "The path identifies the resource, as in /users/{id}. A query parameter filters or pages, as in ?status=active. Headers carry metadata such as auth and content type. The body carries the resource for POST, PUT, or PATCH.",
    simple:
      "Changing the path id reads a different user. Changing a query parameter changes the filter. Putting the JSON in a header, or the token only in the body, usually fails the contract.",
    points: [
      "A path parameter is part of the route. A query parameter is after the question mark.",
      "Content-Type describes the body. Accept describes the response I want.",
      "GET filters belong in the query string unless the contract says otherwise. Secrets in a query string land in access logs.",
    ],
    sources: ra("page 5", "queryParam"),
    related: ["ra-params", "ra-headers", "ra-post"],
  },
  {
    id: "ra-setup",
    group: "ra-requests",
    title: "How do you set up REST Assured in a Java project?",
    aliases: ["rest assured maven", "baseuri", "rest assured setup"],
    basis: BASIS,
    summary:
      "I add the REST Assured dependency in Maven, then set RestAssured.baseURI once for the environment. Tests call a path such as /users/1 instead of repeating the host.",
    simple:
      "The dependency brings in the DSL. baseURI is the host. The path on get() or post() is added after it. The host comes from a test property, not from a production secret in source.",
    points: [
      "The usual coordinate is io.rest-assured:rest-assured. Hamcrest arrives with it. JSON Schema validation needs io.rest-assured:json-schema-validator.",
      "The notes use TestNG @BeforeClass to set baseURI before the tests in that class.",
      "JUnit and TestNG both work. I stay with the runner the project already uses.",
    ],
    example: {
      code: `import io.restassured.RestAssured;
import org.testng.annotations.BeforeClass;

public class ApiSetup {
    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "https://api.example.com";
    }
}`,
      output: NOT_RUN,
    },
    sources: [...ra("page 2", "baseURI"), ...explain("page 3", "baseURI")],
    related: ["ra-gwt", "ra-spec", "ra-testng"],
  },
  {
    id: "ra-gwt",
    group: "ra-requests",
    title: "What is the purpose of given(), when(), and then()?",
    aliases: ["given when then", "given when", "then block"],
    basis: BASIS,
    summary:
      "given() builds the request: headers, auth, params, and body. when() sends it: get, post, put, patch, or delete. then() checks the status, headers, cookies, and body, or extracts a value.",
    simple:
      "I read a test as: given this request, when I call the API, then I expect this result. when() is optional sugar. given().get(...) is valid.",
    points: [
      "The notes put content type, cookies, auth, params, and headers in given().",
      "The notes put the HTTP method in when(), and status, extraction, headers, cookies, and body checks in then().",
      "A test with no then() assertion only proves that the client did not throw. I still assert the contract.",
    ],
    sources: ra("page 2", "given"),
    related: ["ra-get", "ra-validate", "ra-extract"],
  },
  {
    id: "ra-get",
    group: "ra-requests",
    title: "How do you send a GET request?",
    aliases: ["get request", "get user"],
    basis: BASIS,
    summary:
      "I send GET with given().when().get(path), then assert the status and the fields the contract promises. The host below is an example, not a live project API.",
    simple:
      "GET should not create or change a user. I use it to read /users/1 and to confirm a later POST really saved what it returned.",
    points: [
      "given() here adds nothing, which is fine for a public read.",
      "body(\"id\", equalTo(1)) matches only if the JSON field id is the number 1, not the string \"1\".",
      "The URL is illustrative. I was not calling a real service.",
    ],
    example: {
      code: `import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import org.testng.annotations.Test;

public class ApiTest {
    @Test
    public void getUser() {
        given()
        .when()
            .get("https://api.example.com/users/1")
        .then()
            .statusCode(200)
            .body("id", equalTo(1));
    }
}`,
      output: `${NOT_RUN} A matching body would contain a numeric id of 1.`,
    },
    sources: ra("page 2", "get"),
    related: ["ra-gwt", "ra-validate", "ra-chain"],
  },
  {
    id: "ra-post",
    group: "ra-requests",
    title: "How do you send a POST request with a JSON body?",
    aliases: ["post request", "json body", "request body map"],
    basis: BASIS,
    summary:
      "I set the content type, pass the body, and post the path. A Map is serialized to JSON when Jackson or Gson is on the classpath. I assert the status the contract defines. I do not assume every successful POST returns 201.",
    simple:
      "POST /users with a name and job asks the server to create a user. The response might be 201 with an id, or 200 with the saved object. The contract, not the tool, decides.",
    points: [
      "The notes show a raw JSON string and a HashMap. Both are valid. The Map needs a JSON library to become a JSON object.",
      "Without content type application/json, the server may answer 415.",
      "I use example data. This call was not sent.",
    ],
    example: {
      code: `import static io.restassured.RestAssured.given;

import java.util.HashMap;
import java.util.Map;

Map<String, Object> requestBody = new HashMap<>();
requestBody.put("name", "Rajat");
requestBody.put("job", "QA");

given()
    .contentType("application/json")
    .body(requestBody)
.when()
    .post("/users")
.then()
    .statusCode(201);`,
      output: `${NOT_RUN} 201 is only correct when this API's contract says created.`,
    },
    sources: [...ra("page 3", "JSON body"), ...explain("page 3", "HashMap")],
    related: ["ra-body", "ra-extract", "ra-chain"],
  },
  {
    id: "ra-body",
    group: "ra-requests",
    title: "How do you build a request body with a string, Map, POJO, or file?",
    aliases: ["pojo body", "json file body", "request body types"],
    basis: BASIS,
    summary:
      "body() accepts a JSON string, a Map, a POJO, or a file. I use a string for a one-off payload, a Map in a small test, and a POJO or builder when many tests share the shape.",
    simple:
      "The wire format is still JSON. The Java type is only how I build it. A missing getter on a POJO can send an empty object, so I check the logged body when a 400 is unexpected.",
    points: [
      "A JSON string must be valid JSON. A trailing comma is a malformed body and often returns 400.",
      "A file is read from the test resources path I control, not from a laptop path that only I have.",
      "Serialization of a POJO is a separate topic. The notes themselves show the string and the HashMap.",
    ],
    example: {
      code: `given().contentType("application/json")
    .body("{\\"name\\":\\"Rajat\\",\\"job\\":\\"QA\\"}");

given().contentType("application/json")
    .body(new File("src/test/resources/user.json"));`,
      output: `${NOT_RUN} The file path is an example layout, not a file in this website.`,
    },
    sources: ra("page 3", "John"),
    related: ["ra-post", "ra-serdes", "ra-negative"],
  },
  {
    id: "ra-put",
    group: "ra-requests",
    title: "How do you send PUT and PATCH requests?",
    aliases: ["put and patch", "patch request", "put request"],
    basis: BASIS,
    summary:
      "PUT and PATCH both use body() and a path that identifies the record. I treat PUT as replacement and PATCH as a partial change, then I read the resource again and check that untouched fields stayed put.",
    simple:
      "The notes' PATCH sample sends only the title. That matches a partial update. A PUT sample that sends the whole object matches replacement. The service under test may still differ, so I confirm the contract.",
    points: [
      "I identify the record with a path id I just created, not with a hard-coded id that another test can change.",
      "After 200, I GET the same id. The changed field must be new. The fields I did not mean to change must be old.",
      "A 200 that returns the new value is not enough if the database still has the old value.",
    ],
    example: {
      code: `given()
    .contentType("application/json")
    .body("{\\"job\\":\\"SDET\\"}")
.when()
    .patch("/users/1")
.then()
    .statusCode(200)
    .body("job", equalTo("SDET"));`,
      output: `${NOT_RUN} The following GET should still show the original name when PATCH is partial.`,
    },
    sources: explain("page 4", "PATCH"),
    related: ["ra-update", "ra-methods", "ra-post"],
  },
  {
    id: "ra-delete",
    group: "ra-requests",
    title: "How do you send a DELETE request?",
    aliases: ["delete request", "delete user"],
    basis: BASIS,
    summary:
      "DELETE targets one resource. I assert the success code the contract names, then GET the same id and expect 404, or a soft-delete flag, depending on the API. An empty body is one possible success shape, not the only one.",
    simple:
      "I delete only data this test created. A delete of a shared fixture breaks the next test. If the API has no delete, I do not invent one.",
    points: [
      "The framework notes expect a successful delete to have an empty body. Many APIs return 204 with no body, or 200 with an empty object. I assert the documented shape.",
      "After delete, a second delete may be 404 or 204. I check the contract before calling it idempotent.",
      "deleteMany-style cleanup does not belong in an API test. I delete by the id I extracted.",
    ],
    example: {
      code: `given()
.when()
    .delete("/users/" + userId)
.then()
    .statusCode(204);

given()
.when()
    .get("/users/" + userId)
.then()
    .statusCode(404);`,
      output: `${NOT_RUN} 204 then 404 is an example contract, not a universal rule.`,
    },
    sources: explain("page 4", "DELETE"),
    related: ["ra-chain", "ra-negative", "ra-methods"],
  },
  {
    id: "ra-params",
    group: "ra-requests",
    title: "How do path parameters, query parameters, and form parameters differ?",
    aliases: ["queryparam", "formparam", "pathparam"],
    basis: BASIS,
    summary:
      "pathParam() fills a {name} in the path. queryParam() adds ?name=value. formParam() sends application/x-www-form-urlencoded fields. param() picks query or form from the method, so I use the explicit method when the intent matters.",
    simple:
      "For GET /users/{id}?status=active, id is a path parameter and status is a query parameter. A login form uses formParam, not a JSON body.",
    points: [
      "The notes say param() follows the method: it is a shortcut, not a third place to store data. POST can turn param() into a form field. I do not use it for JSON.",
      "pathParam(\"id\", 1) with /users/{id} becomes /users/1. A query parameter would leave the brace unfilled.",
      "The sample form uses a placeholder username and password. I still avoid logging that body.",
    ],
    example: {
      code: `given()
    .pathParam("id", 1)
    .queryParam("status", "active")
.when()
    .get("/users/{id}")
.then()
    .statusCode(200);

given()
    .formParam("username", "qa.user")
    .formParam("password", "example-password")
.when()
    .post("/login");`,
      output: `${NOT_RUN} The password is a placeholder, not a real credential.`,
    },
    sources: ra("page 4", "queryParam"),
    related: ["ra-parts", "ra-post", "ra-log"],
  },
  {
    id: "ra-headers",
    group: "ra-requests",
    title: "How do you set headers, cookies, and content type?",
    aliases: ["request headers", "content type", "cookies"],
    basis: BASIS,
    summary:
      "header() and contentType() set request metadata. cookie() sends a cookie I already have. On the response, header() and cookie() assert or extract. I compare content type with containsString because the value often includes a charset.",
    simple:
      "Content-Type tells the server how to read the body. Accept tells it how I want the answer. A session cookie is a name and value, not a JSON field.",
    points: [
      "The notes extract a cookie with the name \"Stirng\". That is a typo. I use the cookie name the server sets, then send that name back.",
      "An exact header(\"Content-Type\", \"application/json\") fails when the value is application/json;charset=UTF-8.",
      "I do not copy a session cookie from production into a test.",
    ],
    example: {
      code: `import static org.hamcrest.Matchers.containsString;

given()
    .header("Accept", "application/json")
    .contentType("application/json")
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .header("Content-Type", containsString("application/json"));`,
      output: NOT_RUN,
    },
    sources: ra("page 5", "Content-Type"),
    related: ["ra-validate", "ra-auth", "ra-log"],
  },
  {
    id: "ra-multipart",
    group: "ra-requests",
    title: "How do you upload a file with multipart form data?",
    aliases: ["multipart", "file upload", "multipart form"],
    basis: BASIS,
    summary:
      "multiPart() sends a file part, optionally with text parts. I do not also force a JSON content type on the whole request, because multipart has its own content type and boundary.",
    simple:
      "The request is a form with a file field. REST Assured builds the boundary. I assert the status and the id or file name the contract returns, then I do not leave a large file behind if the API can delete it.",
    points: [
      "The notes use new File(\"path/to/file.txt\") and the part name \"file\". The part name must match the API.",
      "A missing file throws before the request is sent. That failure is local, not a 404 from the server.",
      "This website does not include that sample file, and the upload was not sent.",
    ],
    example: {
      code: `File file = new File("src/test/resources/sample.txt");
given()
    .multiPart("file", file)
    .multiPart("label", "qa-sample")
.when()
    .post("/uploads")
.then()
    .statusCode(201);`,
      output: `${NOT_RUN} 201 depends on the upload contract.`,
    },
    sources: ra("page 7", "multiPart"),
    related: ["ra-params", "ra-negative", "ra-headers"],
  },
  {
    id: "ra-validate",
    group: "ra-validation",
    title: "How do you validate status, body, headers, and cookies?",
    aliases: ["validate response body", "statuscode", "response headers"],
    basis: BASIS,
    summary:
      "In then() I chain statusCode(), body(), header(), and cookie(). Each body() path is a JSONPath. Several body() calls are several checks on the same response, not several requests.",
    simple:
      "I check the code first, then the fields that matter, then the content type. A cookie assertion uses the cookie name the server documents.",
    points: [
      "The notes check userId, id, and title as top-level fields. That matches a flat post object. It does not match a body wrapped in data unless I change the path.",
      "notNullValue() only proves the field is present. It does not prove the value is correct.",
      "header and cookie checks are exact unless I pass a matcher such as containsString.",
    ],
    example: {
      code: `given()
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .header("Content-Type", containsString("application/json"))
    .body("id", equalTo(1))
    .body("name", notNullValue());`,
      output: NOT_RUN,
    },
    sources: ra("page 3", "statusCode"),
    related: ["ra-extract", "ra-hamcrest", "ra-nested"],
  },
  {
    id: "ra-extract",
    group: "ra-validation",
    title: "How do you extract values with extract() and JSONPath?",
    aliases: ["jsonpath", "extract path", "response asstring"],
    basis: BASIS,
    summary:
      "extract().path() returns a value from the JSON body. response.jsonPath().get() does the same after I have stored the response. I use the value in the next request. asString() and getBody().asString() both return the body, not the headers.",
    simple:
      "The notes contrast asString() with getBody().asString() as whole response versus body. In REST Assured both return the body. Headers come from getHeader() or getHeaders(). log().all() is what shows the exchange.",
    points: [
      "path(\"id\") can be an Integer, a String, or null. Assigning it straight to int throws if it is null or not a number.",
      "The notes read title from /posts/1 on a public demo host. That demo shape is { userId, id, title, body }. I still treat the call as an example, not a test I ran.",
      "A path that assumes the wrong shape returns null. I compare the path with the actual JSON before changing production code.",
    ],
    example: {
      code: `int userId =
    given()
        .contentType("application/json")
        .body(requestBody)
    .when()
        .post("/users")
    .then()
        .statusCode(201)
        .extract()
        .path("id");`,
      output: `${NOT_RUN} userId is then reused on GET, PUT, or DELETE. 201 must match the contract.`,
    },
    sources: ra("page 4", "extract"),
    related: ["ra-dynamic", "ra-chain", "ra-nested"],
  },
  {
    id: "ra-nested",
    group: "ra-validation",
    title: "How do you validate nested JSON, arrays, and an anonymous root?",
    aliases: ["nested json", "anonymous json", "json array"],
    basis: BASIS,
    summary:
      "A dot path reads a nested field. hasItems() checks that an array contains values. An array with no field name is an anonymous root. The notes address it as $ or as an empty path. The path has to match the example JSON.",
    simple:
      "data.email means the body has an object data with a field email. It fails if email is at the top level. A root array has no data wrapper, so the path starts at the array.",
    points: [
      "body(\"skills\", hasItem(\"Selenium\")) needs a JSON array of strings. hasItems on the wrong path fails even when the values exist elsewhere.",
      "The notes' odds.price example is tied to that response shape. I do not reuse the path on a user API.",
      "An empty array is not the same as a missing field. hasSize(0) is the empty check.",
    ],
    example: {
      code: `given()
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .body("data.email", equalTo("amit@example.com"));

when()
    .get("/ids")
.then()
    .body("", hasItems(1, 2, 3));`,
      output: `${NOT_RUN} The nested check expects { "data": { "email": "amit@example.com" } }. The root check expects a JSON array.`,
    },
    sources: ra("page 8", "Anonymous"),
    related: ["ra-hamcrest", "ra-validate", "ra-schema"],
  },
  {
    id: "ra-hamcrest",
    group: "ra-validation",
    title: "What is the role of Hamcrest matchers?",
    aliases: ["hamcrest", "hasitems", "equalto"],
    basis: BASIS,
    summary:
      "Hamcrest supplies the matchers inside body(), header(), and time(). equalTo is an exact match. hasItem and hasItems look inside collections. notNullValue, containsString, and lessThan cover the other checks I use most.",
    simple:
      "REST Assured does not invent those words. They come from org.hamcrest.Matchers. A wrong static import is a compile error, not an API failure.",
    points: [
      "equalTo is case-sensitive and type-sensitive.",
      "hasItems requires every listed value. hasItem requires one.",
      "I import the matcher I use. I do not fully qualify one call and statically import the next without a reason.",
    ],
    example: {
      code: `import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItems;

.then()
    .body("id", equalTo(1))
    .body("skills", hasItems("Java", "Selenium"));`,
      output: NOT_RUN,
    },
    sources: ra("page 8", "Hamcrest"),
    related: ["ra-validate", "ra-nested", "ra-time"],
  },
  {
    id: "ra-schema",
    group: "ra-validation",
    title: "How do you validate a JSON response against a JSON Schema?",
    aliases: ["json schema", "schema validation"],
    basis: BASIS,
    summary:
      "A JSON Schema checks types and required fields, not the business value of one user. I put the schema on the test classpath and use matchesJsonSchemaInClasspath. The schema module is a separate dependency.",
    simple:
      "equalTo checks that this email is Amit's. The schema checks that email is a string and id is present. I use both when the contract is stable.",
    points: [
      "This topic is not in the saved REST Assured notes. It is a prepared interview answer.",
      "The dependency is io.rest-assured:json-schema-validator, aligned with the REST Assured version.",
      "A schema failure names the path. I still do not weaken the schema to make a bad response pass.",
    ],
    example: {
      code: `import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

given()
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .body(matchesJsonSchemaInClasspath("user-schema.json"));`,
      output: `${NOT_RUN} user-schema.json is an example classpath resource, not a file shipped here.`,
    },
    sources: [],
    related: ["ra-validate", "ra-serdes", "ra-nested"],
  },
  {
    id: "ra-xml",
    group: "ra-validation",
    title: "How do you handle XML responses?",
    aliases: ["xmlpath", "xml response"],
    basis: BASIS,
    summary:
      "xmlPath().getString() reads an XML path such as person.name. I accept XML and I do not assume a JSON content type. Namespaces and the real element names decide the path.",
    simple:
      "person.name means a name element inside person. If the service uses a namespace, the plain path can miss the node even though the text is in the body.",
    points: [
      "The notes print the name after a GET. That sample was not run from this project.",
      "I assert the value in the test. System.out is only a debug aid, and it must not print secrets.",
      "JSONPath and XmlPath are different objects. A JSON path does not read XML.",
    ],
    example: {
      code: `Response response = given()
    .accept("application/xml")
.when()
    .get("/people/1");
String name = response.xmlPath().getString("person.name");`,
      output: `${NOT_RUN} The path matches <person><name>...</name></person> only for that illustrative shape.`,
    },
    sources: ra("page 8", "xmlPath"),
    related: ["ra-extract", "ra-headers", "ra-validate"],
  },
  {
    id: "ra-serdes",
    group: "ra-validation",
    title: "What are serialization and deserialization?",
    aliases: ["serialization", "deserialization", "pojo"],
    basis: BASIS,
    summary:
      "Serialization turns a Java object into JSON for the request. Deserialization turns the JSON response into a Java object. REST Assured uses Jackson or Gson when that library is on the classpath. response.as(User.class) is the deserialize step.",
    simple:
      "I build a User, pass it to body(), and the client writes {\"name\":\"Rajat\",\"job\":\"QA\"}. Coming back, as(User.class) fills the fields I can assert without a string path.",
    points: [
      "This is a prepared explanation. The saved notes show a HashMap and a JSON string, not a POJO mapper.",
      "Private fields need getters and setters, or Jackson annotations, or the JSON can be empty.",
      "A field named id in JSON and userId in Java will not map unless I alias it. That mismatch looks like missing data.",
    ],
    example: {
      code: `User created = given()
    .contentType(ContentType.JSON)
    .body(new User("Rajat", "QA"))
.when()
    .post("/users")
.then()
    .statusCode(201)
    .extract()
    .as(User.class);`,
      output: `${NOT_RUN} User is an illustrative POJO. The mapper was not run.`,
    },
    sources: [],
    related: ["ra-body", "ra-post", "ra-schema"],
  },
  {
    id: "ra-time",
    group: "ra-validation",
    title: "How do you measure response time, and what are the limits?",
    aliases: ["response time", "timein"],
    basis: BASIS,
    summary:
      "response.time() returns the elapsed time of that one call in milliseconds. timeIn(TimeUnit.SECONDS) converts it. then().time(lessThan(...)) can fail a very slow call. It is not a load or performance test.",
    simple:
      "One sample includes my network, the laptop, and the server at that moment. A limit of 200 milliseconds will flake. I use a loose guard or I leave performance to a tool built for it.",
    points: [
      "The notes show RestAssured.get(\"/users/eugenp\") and timeIn. I treat eugenp as their example user, not as data I created.",
      "A failed time assertion does not explain a wrong body. I still assert the contract.",
      "I do not retry a slow POST just to get a better number.",
    ],
    example: {
      code: `Response response = given().when().get("/users/1");
long millis = response.time();
long seconds = response.timeIn(TimeUnit.SECONDS);`,
      output: `${NOT_RUN} The numbers would describe one call only.`,
    },
    sources: ra("page 8", "timeIn"),
    related: ["ra-debug", "ra-hamcrest", "ra-validate"],
  },
  {
    id: "ra-auth",
    group: "ra-auth",
    title: "How do you handle Basic auth, Bearer tokens, API keys, and OAuth 2.0?",
    aliases: ["basic authentication", "bearer token", "oauth", "api key", "authentication and authorization"],
    basis: BASIS,
    summary:
      "Authentication answers who is calling. Authorization answers what that caller may do. Basic auth sends a username and password. Bearer and oauth2() send an access token. An API key goes in the header or query the contract names. A missing token is usually 401. A valid token for the wrong role is usually 403.",
    simple:
      "auth().basic waits for a challenge unless I call preemptive().basic, which sends the header on the first request. auth().oauth2(\"example-token\") sets Authorization: Bearer. The token here is a placeholder.",
    points: [
      "The notes show auth().basic(\"username\", \"password\") and say Digest and OAuth are supported. They do not show a live OAuth dance. I keep it that way.",
      "Most APIs I test want the Basic header immediately, so I use preemptive().basic with values from the environment.",
      "An API key in a query string is easier to leak into logs than a header. I follow the contract and still redact it.",
      "Basic, Bearer, an API key, and OAuth prove identity. The role check behind them is authorization. A 200 with a valid token does not prove that check ran.",
      "Client-credentials and authorization-code are different OAuth grants. The test should use a test account, and I do not build the full login product inside one test.",
    ],
    example: {
      code: `given()
    .auth().preemptive().basic("qa.user", "example-password")
.when()
    .get("/account");

given()
    .auth().oauth2("example-token")
.when()
    .get("/users/1");

given()
    .header("X-Api-Key", "example-api-key")
.when()
    .get("/users");`,
      output: `${NOT_RUN} example-token and example-api-key are placeholders.`,
    },
    sources: ra("page 3", "basic"),
    related: ["ra-status", "ra-dynamic", "ra-log"],
  },
  {
    id: "ra-dynamic",
    group: "ra-auth",
    title: "How do you handle dynamic ids and tokens?",
    aliases: ["dynamic id", "dynamic token", "reuse response"],
    basis: BASIS,
    summary:
      "I extract the id or token from the response that created it, store it in a local variable, and pass it to the next request. I do not hard-code an id that another run may have deleted.",
    simple:
      "Login returns a token. Create returns an id. The next call uses both. If the path is null, I stop and look at the real JSON instead of sending /users/null.",
    points: [
      "The notes mention regular expressions or JSONPath for dynamic values. JSONPath is the default. A regex is for a value buried in text.",
      "A token expires. A 401 on the second call can be expiry, not a bad URL.",
      "I keep the extracted values inside the test. I do not write them into a shared static that other tests mutate.",
    ],
    example: {
      code: `String token = given()
    .contentType("application/json")
    .body("{\\"username\\":\\"qa.user\\",\\"password\\":\\"example-password\\"}")
.when()
    .post("/login")
.then()
    .statusCode(200)
    .extract()
    .path("token");`,
      output: `${NOT_RUN} The next request would send the placeholder token as a Bearer value.`,
    },
    sources: ra("page 2", "dynamic"),
    related: ["ra-extract", "ra-chain", "ra-auth"],
  },
  {
    id: "ra-log",
    group: "ra-auth",
    title: "How do you log a request and response without leaking secrets?",
    aliases: ["request logging", "log all", "redact token"],
    basis: BASIS,
    summary:
      "log().status() and log().body() show the response. given().log().all() shows the request, including Authorization and a password body. I log the URI, status, and a redacted body, and I turn full logs on when validation fails.",
    simple:
      "The framework notes use log().status() and log().body() so a failure is visible. I add a rule: never attach a raw access token or password to a report or a bug.",
    points: [
      "ifValidationFails() keeps passing tests quiet and still captures the failing exchange.",
      "A filter can replace the Authorization header with [redacted] before logging.",
      "Query parameters that hold API keys are still secrets.",
    ],
    example: {
      code: `given()
    .auth().oauth2("example-token")
    .log().ifValidationFails()
.when()
    .get("/users/1")
.then()
    .log().ifValidationFails()
    .statusCode(200);`,
      output: `${NOT_RUN} A real log must not include example-token once a real token replaces it.`,
    },
    sources: explain("page 3", "log"),
    related: ["ra-debug", "ra-auth", "ra-headers"],
  },
  {
    id: "ra-ssl",
    group: "ra-auth",
    title: "How do you handle SSL certificate validation in a test environment?",
    aliases: ["relaxedhttpsvalidation", "ssl certificate"],
    basis: BASIS,
    summary:
      "relaxedHTTPSValidation() tells REST Assured to accept a certificate a normal client would reject. I use it only for a known test host that does not have a trusted certificate. I do not make it the default for production.",
    simple:
      "A self-signed test certificate fails the JVM trust check before the API runs. Relaxing that check lets the test reach the host. It also hides a bad certificate, so it stays off outside that environment.",
    points: [
      "The notes call self-signed.badssl.com. That is their public illustration. I did not call it from here.",
      "The better test setup is a certificate the test JVM trusts, not a permanent bypass.",
      "A production failure caused by a certificate is a defect. Relaxing the check would hide it.",
    ],
    example: {
      code: `given()
    .relaxedHTTPSValidation()
.when()
    .get("https://test-host.example")
.then()
    .statusCode(200);`,
      output: `${NOT_RUN} The bypass is for a controlled test host only.`,
    },
    sources: ra("page 6", "SSL"),
    related: ["ra-setup", "ra-debug", "ra-log"],
  },
  {
    id: "ra-spec",
    group: "ra-sdet",
    title: "How do you reuse request specs, response specs, and the base URL?",
    aliases: ["request specification", "requestspecbuilder", "base url"],
    basis: BASIS,
    summary:
      "A RequestSpecification holds the base URI, common headers, and content type. A ResponseSpecification holds checks I repeat, such as 200 and JSON. The base URI comes from the environment. Tests call given().spec(requestSpec).",
    simple:
      "I build the shared request once. Each test adds only what is different: the path, the body, or a token. I do not copy the host into forty tests.",
    points: [
      "This is a small reuse pattern, not an enterprise framework.",
      "A spec can set a header. A test can still override a header for a negative case.",
      "I do not put a password inside the shared spec that every log prints.",
    ],
    example: {
      code: `import io.restassured.builder.RequestSpecBuilder;
import io.restassured.specification.RequestSpecification;

RequestSpecification requestSpec =
    new RequestSpecBuilder()
        .setBaseUri("https://api.example.com")
        .addHeader("Accept", "application/json")
        .build();

given()
    .spec(requestSpec)
.when()
    .get("/users/1")
.then()
    .statusCode(200);`,
      output: NOT_RUN,
    },
    sources: [],
    related: ["ra-setup", "ra-testng", "ra-log"],
  },
  {
    id: "ra-testng",
    group: "ra-sdet",
    title: "How do you organize API tests and data-driven cases in TestNG?",
    aliases: ["testng api tests", "data provider", "data driven api"],
    basis: BASIS,
    summary:
      "Each API behavior is one @Test. @BeforeClass sets the base URI. A DataProvider feeds invalid and valid rows without copying the request. Tests do not depend on each other's order.",
    simple:
      "The notes' suite uses @BeforeClass for the host and one @Test per method. I add a data provider when the same call must run with several bodies. Cleanup stays in the test that created the data.",
    points: [
      "A data-driven 400 case and a 201 case should not share one assertion that ignores the expected code.",
      "parallel=\"methods\" needs independent data. Two tests posting the same email will collide.",
      "Maven runs the suite with mvn test. Surefire writes the result I archive in CI.",
    ],
    example: {
      code: `@DataProvider
public Object[][] names() {
    return new Object[][] { {"Rajat"}, {"Amit"} };
}

@Test(dataProvider = "names")
public void createUser(String name) {
    given().contentType("application/json")
        .body("{\\"name\\":\\"" + name + "\\",\\"job\\":\\"QA\\"}")
    .when().post("/users")
    .then().statusCode(201);
}`,
      output: `${NOT_RUN} Each row needs its own cleanup if the API stores the user.`,
    },
    sources: explain("page 3", "BeforeClass"),
    related: ["ra-spec", "ra-negative", "ra-chain"],
  },
  {
    id: "ra-chain",
    group: "ra-sdet",
    title: "How do you create a user, read it back, and clean it up?",
    aliases: ["api chaining", "create and retrieve", "test data cleanup"],
    basis: BASIS,
    summary:
      "I log in if the route requires a token, POST the user, extract the id, GET that id, and compare the fields I sent. In a finally block I DELETE that id when the environment allows it.",
    simple:
      "The id is dynamic. The GET proves the POST was stored, not only that the POST returned JSON. Cleanup uses the same id so I do not delete someone else's user.",
    points: [
      "I compare name, email, and job. I also compare types: a numeric id is not the string of that number.",
      "If DELETE is forbidden in that environment, I use a unique email and say the row was left behind. I do not delete a shared user.",
      "A token extracted in step one is a secret for the rest of the test. Logs stay redacted.",
    ],
    example: {
      code: `String token = given()
    .contentType("application/json")
    .body("{\\"username\\":\\"qa.user\\",\\"password\\":\\"example-password\\"}")
.when().post("/login")
.then().statusCode(200).extract().path("token");

int userId = given()
    .auth().oauth2(token)
    .contentType("application/json")
    .body(requestBody)
.when().post("/users")
.then().statusCode(201).extract().path("id");

given().auth().oauth2(token)
.when().get("/users/" + userId)
.then().statusCode(200).body("name", equalTo("Rajat"));`,
      output: `${NOT_RUN} The matching DELETE belongs in finally. Status codes follow the contract.`,
    },
    questions: [
      {
        prompt: "What do you do if the GET after POST returns 404?",
        short: "I check the id, the host, the token, and whether the POST wrote to another environment.",
        detail: "A 201 with an id and a 404 on that id means the read path, the database, or the environment disagrees with the create response. I do not change the assertion to 404.",
      },
    ],
    sources: [],
    related: ["ra-post", "ra-extract", "ra-dynamic", "ra-delete"],
  },
  {
    id: "ra-update",
    group: "ra-sdet",
    title: "How do you validate that an update changed only the intended fields?",
    aliases: ["validate an update", "unchanged fields"],
    basis: BASIS,
    summary:
      "I GET the record first, send PUT or PATCH with the contract payload, check the response, then GET again. The intended fields must change. The other fields must match the first GET.",
    simple:
      "A 200 is not the proof. The proof is the second read, and the database row when I can query it. If the name changes after a job-only PATCH, the API replaced the resource or mapped the body badly.",
    points: [
      "I store the original email and name before the call.",
      "I use the id from the create step, not a fixed id on a shared user.",
      "PUT may clear a missing field. If the contract is partial, I call PATCH and I say so.",
    ],
    example: {
      code: `given()
    .contentType("application/json")
    .body("{\\"job\\":\\"SDET\\"}")
.when()
    .patch("/users/" + userId)
.then()
    .statusCode(200)
    .body("job", equalTo("SDET"))
    .body("name", equalTo("Rajat"));`,
      output: `${NOT_RUN} name stays Rajat only when the API applies a partial update.`,
    },
    sources: [],
    related: ["ra-put", "ra-db", "ra-chain"],
  },
  {
    id: "ra-negative",
    group: "ra-sdet",
    title: "How do you test negative API cases?",
    aliases: ["negative api testing", "invalid input", "malformed json"],
    basis: BASIS,
    summary:
      "I break one rule at a time: a missing field, a wrong type, a bad id, malformed JSON, no token, the wrong role, a duplicate email, a bad query, an empty string, and a boundary value. The expected code and error body come from the contract.",
    simple:
      "I do not invent 400 for every mistake. One API returns 422 for a bad email and 409 for a duplicate. I assert the documented code and a stable error field, not a whole stack trace.",
    points: [
      "Missing token: 401. Valid token, wrong role: 403. Unknown id: 404. Wrong content type: 415.",
      "Malformed JSON is a bad body. A well-formed JSON with the wrong field type is a different case.",
      "Duplicate email checks need two creates. I clean up both ids if they were stored.",
      "Empty string, null, and a missing field are three payloads.",
    ],
    mistakes: ["Asserting the error message text when the contract only fixes the code.", "Sending five faults in one request so the failure is ambiguous."],
    sources: [],
    related: ["ra-status", "ra-auth", "ra-chain"],
  },
  {
    id: "ra-db",
    group: "ra-sdet",
    title: "How do you validate an API response against MongoDB or SQL?",
    aliases: ["api and database", "mongodb validation", "sql validation"],
    basis: BASIS,
    summary:
      "I call the API, keep the id and the fields I care about, then read that row with the database's own query. I compare values and types. A match on the response alone does not prove the write.",
    simple:
      "For MongoDB I look up the document by the id the API returned, or by the email if the id is generated in the database. For SQL I select that primary key. I do not convert a SQL query into a Mongo query.",
    points: [
      "An API id may be a string while MongoDB stores an ObjectId. A type mismatch returns no document even when the user exists.",
      "I check the changed field and one field that should not have changed.",
      "Missing, duplicate, and stale rows are different defects. count or a second query separates them.",
      "No database connection is configured in these lessons, and the sample queries were not run.",
    ],
    example: {
      code: `// After POST /users returns id "65a000000000000000000001"
db.users.findOne({ email: "amit@example.com" })

-- Illustrative SQL, not a Mongo query
SELECT email, job FROM users WHERE id = 1;`,
      output: `${NOT_RUN} Compare email and job with the API body. These are examples, not live records.`,
    },
    sources: [],
    related: ["ra-chain", "ra-update", "ra-debug"],
  },
  {
    id: "ra-debug",
    group: "ra-sdet",
    title: "How do you investigate an API failure and run the suite in CI?",
    aliases: ["intermittent api", "jenkins api tests", "api failure"],
    basis: BASIS,
    summary:
      "I record the method, URL, status, correlation id, and a redacted body. Then I separate a wrong contract, a bad token, the wrong environment, and a timing flake. In Jenkins I run Maven, publish the Surefire report, and inject the base URL and token as secrets.",
    simple:
      "A 401 may be an expired token. A 404 may be the wrong host. A value that is wrong only sometimes may be eventual consistency or shared data. I do not rerun a failed create until it passes and then ignore it.",
    points: [
      "Unexpected status: confirm method, path, and environment. Wrong value: compare the request body with the GET and the database. Missing field: confirm the JSONPath and the schema.",
      "Auth failure: token present, not expired, right environment. Configuration: baseURI is the environment I think it is.",
      "Intermittent: look for shared users, no cleanup, and a read that races a write. Retry a GET only when the product is eventually consistent, and bound the retry.",
      "CI is mvn -B test, or a TestNG suite file. The console must not print the token. Reports come from Surefire or the project's report plugin.",
    ],
    questions: [
      {
        prompt: "What evidence do you attach to a defect?",
        short: "Method, URL, status, correlation id, expected value, actual value, and a redacted body.",
        detail: "I remove Authorization, cookies, passwords, and personal data. I say which environment it was. I do not attach a token to reproduce it.",
      },
    ],
    mistakes: ["Marking a flake as passed after one green rerun.", "Pointing the suite at production to debug a test defect."],
    sources: [],
    related: ["ra-log", "ra-ssl", "ra-chain", "ra-db"],
  },
];

function plain(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function restById(id: string): ConceptLesson | undefined {
  return REST_CONCEPTS.find((lesson) => lesson.id === id);
}

export function restInGroup(group: ConceptGroupId): ConceptLesson[] {
  return REST_CONCEPTS.filter((lesson) => lesson.group === group);
}

export function searchRestLessons(query: string): { id: string; title: string; group: ConceptGroupId; score: number }[] {
  const asked = plain(query);
  if (asked.length < 2) return [];
  return REST_CONCEPTS.map((lesson) => {
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
