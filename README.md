# elysia rest api mastery

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tgr-wjya/elysia-challenge/semgrep.yml)](https://img.shields.io/github/actions/workflow/status/tgr-wjya/elysia-challenge/semgrep.yml)
[![wakatime](https://wakatime.com/badge/user/7dc0c572-d103-462c-8b19-18b2aa52cc80/project/6b6f5ba9-2595-43fd-88cf-8e6ea3953e0b.svg)](https://wakatime.com/badge/user/7dc0c572-d103-462c-8b19-18b2aa52cc80/project/6b6f5ba9-2595-43fd-88cf-8e6ea3953e0b)
[![CodeTime Badge](https://shields.jannchie.com/endpoint?style=social&color=222&url=https%3A%2F%2Fapi.codetime.dev%2Fv3%2Fusers%2Fshield%3Fuid%3D36362)](https://codetime.dev)
[![CodSpeed](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json&style=flat&label=CodSpeed)](https://codspeed.io/tgr-wjya/elysia-challenge?utm_source=badge)

trying to complete elysia mastery challenge. the challenge consist of **rest api**, **type-safety**, **test runner** and **hooks**.

## date

- day 16
- 18 february - 2 march 2026
- week 2

## time spent

- this is deprecated, i'll let both codetime and wakatime track my time spent.

## struggle

- let me look back at what i'm struggling at;
- kinda struggle with the file i/o at first, thankfully i managed to understand it.
- schema is still blurry to me even though its easy to understand.
- its about making the swagger know that there's schema, i'm still struggling at that.
- i'm also still struggling documenting my api using swagger openapi.
- how do you even validate a push with a schema? and make the body to use existing schema? i get what its trying to achieve but i don't understand how to do it.
- what the hell is really `UnionEnum` and is it really a good idea to use it on an array of strings like that?
  - ```typescript
    status: t.UnionEnum(['pending', 'in-progress', 'completed']);
    ```

- what the hell is hooks??
- i'm struggling parsing by `{id}`
- i'll ask a clarifying question tomorrow
- i struggled with `/PATCH`, i think its just bugged. i don't fucking know what happened, i asked plenty of llm diagnosis but none of it were really from my fault so i guess there's something wrong that isn't caused by me, that's the first.
- forgot that you could define a schema as optional in swagger
- i really am struggling with the naming convention, its definitely not following best practice but hey if it works it works.
- almost forgot that you could use double hooks.
- i don't get how this `...body` works.
- struggling with test runner
- struggling at making bun test type-safety.

## realization

- i couldn't stress this enough but yes elysia is easy as i always said.
- if i actually finish this tomorrow then file i/o with res/req might be easier than i thought. you essentially need to read the file -> push -> write which means:
  - ```typescript
    const app = new Elysia().post('/echo', async () => {
      // this reads the file!
      const body = await Bun.file('file.json').json();

      // this is what you're trying to push!
      const newEcho = {
        id: body.Date.now(),
      };

      // this push and write the file!
      body.push(newEcho);
      await Bun.write('file.json', JSON.stringify(newEcho, null, w));
    });
    ```

- remember to always check your `file.json` before attempting to push. the `body` variable or where you store the parsed file, will return whatever is in the json file.
- meaning, if the file contains something other than an array which your handler expect, it'll fail. i'll put the example in the [takeaways](#key-takeaways)
- which mean, if you're not using pushing an object, you should definitely simplify the schema.
- i finally understand hooks and schema... now it all tied together beautifully. let me explain it later
- turns out, parsing by id is really easy. you just define the schema you use as the id.
- then use `.find` or `.map` to find the specific identifier in the `file.json`
- test runner is actually easy as fuck, you're just validating what you've built and to avoid those incident.

## next project

- next project i'll be building a portfolio-kaomoji-api that i used on my portfolio site.
- yess, its a shame to admit this but i vibe-coded those project.
- but shame no more after i completed this project, i'd be able to take on those kaomoji rest api easily!

## honorary mention

nothing worth mentioning here.

## key takeaways

- all the takeaways already addressed in the [realization](#realization)
- i'll say mor if i have something to say obviously.
- what i did wrong in `body.push`:
  - ```typescript
    .post('/echo', () => {
      const body = await Bun.file('tasks.json').json() // this will return whatever the hell is in your json.file

      // your schema is expecting an object/array inside the body, or should i say it wants the body to look like this.
      const newSchema = {
        id: Date.now;
      }

      body.push(newSchema); // you'll get an error: 'body.push' is undefined)
    })
    ```

  - ```json
    # meaning, if your json looks like this:

    {
      "id": "1"
    }

    # and not like this:

    [
      {
        "id": 1771515538781
      }
    ]
    ```

  - it'll refuse to push because it thinks the body is wrong!
  - the more you know...

- keys to understanding hooks and schema. let's say you have an endpoint with this details:
  - `/POST /user` Validate and return input.
  - fields:
    - `username`: string (min length 3)
    - `age`: number (min length 1)
  - you can define the schema in the hooks which swagger will then pick up.
  - ```typescript
    const app = new Elysia().post(
      '/user',
      ({ body }) => {
        const newUser = {
          username: body.username,
          age: body.age,
        };

        // return the request back to the sender
        return newtask;
      },
      {
        // swagger will pick up the schema, so you could easily test the endpoint saving your sanity!
        body: t.Object({
          username: t.String({ minLength: 1 }),
          age: t.Number({ minimum: 1 }),
        }),
      }
    );
    ```

- when you want to fetch a params with an identifier from file, make sure to implicitly tell what `.find` should expect.
- typescript doesn't know what shape your array contain so it'll throw an error, you should clarify what to expect when something like this happen:
  - ```typescript
    // this'll resolve the error
    const tasks: any[] = await Bun.file('tasks.json').json();

    const getTask = {
      id: params.id,
    };

    // or, you can directly resolve it on `.find`
    const getTaskByID = task.getTask((t: Any) => t.id === getTask.id);
    ```

- don't forget that `t` here is an iteration variable, you can name it whatever you want.
- apparently, you don't need `push` when deleting from an endpoint, you just need to overwrite it.
  - ```typescript
    const guestList = await Bun.file('guests.json').json();

    // 1. Create a version of the data without the unwanted guest
    const updatedList = guestList.filter((guest) => guest.name !== 'Bob');

    // 2. Overwrite the entire file with the new, Bob-less array
    await Bun.write('guests.json', JSON.stringify(updatedList));
    ```

- oh my fucking god... i accidentally nested the `json` making the /DELETE endpoint unable to delete it... my life is a mistake.
- ALWAYS PUT A **CAUTION** OR A **REMINDER** FOR YOURSELF!
- i spent 3 hours thinking that bun or elysia might be broken when in reality my `tasks.json` just double nested and i didn't realize it. next time, i'll put a reminder for my dumb-self. this is a mistake...
- you use double hooks for `/PATCH`, shall i tell you how?
  - ```typescript
    .patch('/tasks/:id', async ({params, body, set}) => {
      const tasks = await Bun.file('tasks.json').json();

      const schemaID = {
        id: params.id,
      }

      const updateTask = {
        description: body.description,
        status: body.status,
      }

      // Your logic goes here...
    }, {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Partial(
        t.Object({
          description: t.String({ minLength: 4 }),
          status: t.UnionEnum(['pending', 'in-progress', 'completed']),
        })
      ),
    }
    ```

- one thing to remember that swagger doesn't realize when your schema is optional
- so you need to remember deleting the unused schema to avoid error, for example:
  - ```json
    {
      "description": "",
      "status": "pending"
    }
    ```
  - that will throw an error even though let's say you've already defined them to be optional.
  - if you leave `"status": ""` or `"description": "",` in there, the validator sees a value that doesn't match your Enum, and it rejects the whole request.
  - even if its technically valid, so you need to be wary.
- both `/PATCH` and `/DELETE` has a different prefered method.
  - apparently, in modern javascript/typescript. it's often cleaner to "filter out" what you don't want rather than finding a position and "splicing" it out.
  - that's precisely why you're using `.filter()` and `!==` for `/DELETE`
  - for `/DELETE`
    - `.filter()` goes through every single item in the array and asks a `True/False` question: "should this item stay in the new list?"
    - `!==` (not equal to):
      - if true (it's a different id), the item stays.
      - if false (it's the id you want to delete), the item is dropped.
    - explanation from gemini: "For DELETE: It's actually faster and less messy to just "re-deal" the deck without the unwanted card than it is to try and pull a card out of the middle and shove the rest of the cards together to fill the gap."
  - for `/PATCH`
    - think of your `tasks.json` as a row of lockers.
      - you want to change the sticker on locker #5.
      - you walk down the hallway counting until you hit the 5th locker.
      - you use your key to make sure you are at the exact right door.
      - you open just that one door, swap the sticker, and leave. everything else stays exactly where it was.
    - when you update a task, you need to know exactly which slot in the "cabinet" (the array) it sits in so you can swap out the old data for the new data.
    - `===` strict equality is to match the exact right door.
- let me try to explain spread in a way that make sense for me, here we go.
- explanation from gemini: _When you use ... inside an object, you are telling the code: "Take everything inside this box, dump it out right here, and if anything has the same label, let the new stuff overwrite the old stuff."_
- step by step explanation:
  - ```typescript
    tasks[findID] = {
        ...tasks[findID],
        ...body,
      };

    // before the spread:
    tasks[findID] = {
      id: 123,
      description: 'Old description',
      status: 'pending',
    };

    // ...tasks[findID] copies everything:
    {
      id: 123,
      description: "Old description",
      status: "pending"
    }

    // Then ...body overwrites only what you sent:
    {
      description: "Test 3"
    }
    ```

  - without the `...`, you would have to manually map every single field like a robot.
  - with `...body`, you don't care if the user sent 1 field or 100 fields. it'll takes whatever is in that "box" and merges it into the task.
  - **spreading the old task first ensures you keep fields like id and anything else that shouldn't change. then the
    new body data overwrites only what you're updating.**
  - by doing `...tasks[findID], ...body`:
    - ```typescript
      tasks[findID] = {
        ...tasks[findID], // Start with **ALL** the old data included
        ...body, // Then overwrite **ONLY** what came in
      };

      // You get:
      {
        id: 123,
        description: "New text", // Updated from body
        status: "pending" // Kept from old task so it doesn't get deleted
      }
      ```

  - the whole point of `/PATCH` - update some fields, keep the rest. Without copying the old task first, you'd destroy
    data.

- why you're only using `.push()` for `/POST` and not `/DELETE` and `/PATCH`
  - `.push()` only works for adding new items to an array. For `/PATCH` and `/DELETE`, you're changing what's
    already there or removing it.
- reminder that **you can reference hooks directly without needing a schema**. for example:
  - ```typescript
    .get('tasks/:id', async ({ params }) => {
      const tasks = await Bun.file('tasks.json').json();

      const getTaskByID = tasks.find((t: any) => t.id === params.id)

      return getTaskByID;
    }, {
      params: t.Object({
        id: t.Numeric(),
      })
    })
    ```

-you use `type` for runtime validation when typescript complains about the shape of the object you're passing. for example:

- ```typescript
  // bad practice - reading from a file, typescript couldn't help you complain about stuff that doesn't exist.
  const tasks: any[] = await Bun.file('tasks.json').json();

  // good practice - typescript could help you catch the mistake while typing, it's a runtime validator
  type Task = {
    id: number;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
  };

  const tasks: Task[] = await Bun.file('tasks.json').json();

  // OR

  const getTaskByID = tasks.find((t: Task) => t.id === params.id);
  ```

- i haven't learn enough test runner to say something, maybe tomorrow i'll learn something useful.
- oh btw, the difference of `.toBe()` and `.toEqual()`:
  - with `.toBe()` you're asking if two things are the exact same physical object.
  - "are these two keys for the same lock?" even if they look identical, if they were cut from different pieces of metal, the answer is certainly "no."
  - ```typescript
    // that's why this'll fail, even if the response exactly the same as you written
    const greeting = await response.json();
    expect(greeting).toBe({ greet: 'hello, world' });
    );

    // and this don't
    const greeting = await response.json();
    expect(greeting).toEqual({ greet: 'hello, world' })
    ```

  - you use `.toEqual()` to checks if the values are the same

- claude code recommends [drizzle orm](https://orm.drizzle.team/) for me to learn next, i'll check that out and consider it.
- when writing a test runner, you should definitely use `describe` and `it` rather than `test` alone.
  - `it` is technically an alias for `test`
  - `describe` groups related tests together. an example:
    - ```typescript
      const BASE_URL = 'http://localhost:3000';

      describe('Test responsiveness', () => {
        describe('GET /echo', () => {
          it('Should echo user body validation', async () => {
            const response = await app.handle(new Request(`${BASE_URL}/echo`));

            const greeting = await response.text();
            expect(greeting).toEqual({ greet: 'hello, world' });
          });
        });
      });
      ```

- i almost forgot, yes you should `const` your url. you can just do this:
  - ```typescript
    const BASE_URL = 'http://example.com';

    new Request(`${BASE_URL}/greet`);
    new Request(`${BASE_URL}/tasks`);
    new Request(`${BASE_URL}/tasks/${id}`);
    ```

- you should double check your test runner because its untrustworthy. you could write an incomplete test runner and it'll pass, so make sure to eye-it.
- if only there's a type-safety for test runner...
- if you want to check path status, use `response` directly. for example:
  - ```typescript
    const response = await app.handle(new Request(`${BASE_URL}`));

    const data = await response.json();

    // call response directly here.
    expect(response.status).toBe(404);
    expect(data).toBe('hello!');
    ```

- okay, i learn so much today. let me tell you what happened.
- i absolutely demolish the test runner, as expected it was really that easy. thankfully, i have docs to guide me to the right path.
- apparently, you should use `=== -1` for condition checking in `PATCH` that's certainly if your `findID` function using `findIndex()` and not `find()`. here's why:
  - findIndex returns a number, representing the position of the item in the array.
  - if it finds nothing, it returns -1 specifically. there's no true/false in `findIndex()`, its just was to search an index.
  - so `!taskIndex` won't work because `!0` is true, meaning if your task happens to be at index 0, it would accidentally trigger the 404, meaning you're never connected to the task at all.
  - `=== -1` just basically mean "did findIndex come back empty-handed?" without accidentally catching index 0 in your json.
- `.mockResolvedValue(0)` just means "**pretend write succeeded, return 0 bytes written.**" numbers doesn't matter here, you can put it whatever you want.
- per claude suggestion, you should be scrutinizing your `index2.ts` like crazy, even if the check is insignificant like checking if your `POST` actually reject username shorter than 3 chars with 400.
- best practice for bun test runner:
  - use descriptive test names -
  - ```typescript
    // Good
    test('should calculate total price including tax for multiple items', () => {
      // test implementation
    });

    // Avoid
    test('price calculation', () => {
      // test implementation
    });
    ```

  - group related test, like i did here [index.test.ts](/index.test.ts)
  - use appropriate matchers, don't just be checking with `.toBe()` for everything
  - ```typescript
    // Good: Use specific matchers
    expect(users).toHaveLength(3);
    expect(user.email).toContain('@');
    expect(response.status).toBeGreaterThanOrEqual(200);

    // Avoid: Using toBe for everything
    expect(users.length === 3).toBe(true);
    expect(user.email.includes('@')).toBe(true);
    expect(response.status >= 200).toBe(true);
    ```

- don't forget that you still need to mock `Bun.file` for an endpoint 404 with params, otherwise it'll try to read your real `tasks.json`
- for checking a `404` status, even with mock you could also pass an empty array, it guarantees returning `undefined` regardless of the id you tried to pass. apparently, that's the cleanest way to force 404 checking.
- also remember that if the endpoint were expecting a `body` and you're not using `Content-Type` at all. elysia validator will rejects it with a 400 before your handler even runs
- you should be careful with that otherwise you're never reaching `404` to begin with.
- also, always make sure to check the type of the response, whether its `Array` or `Object` use `.toBeObject()` and `.toBeArray()`
- claude suggested me to try using `.beforeEach()` and `.afterEach()`, i'll give it a try tomorrow.
- currently, the test runner absolutely works, its just missing some validation. let me prepare myself tomorrow with todo;
- i didn't really do much today, btw.
- elysia by default returns `422 Unprocessable Entity` for schema validation so if you're thinking of checking your schema validation in test runner, use `422` and not `400` which is more semantically correct here.
- okay, i just spent an hour checking out debugger and its actually amazing.
- i also checkout [REST CLIENT](https://github.com/Huachao/vscode-restclient) too, its interesting but i don't know whether i'm going to use them regularly or not.
- also, for sending a json body. you need to double quote both property and value. meaning, it look like this: `{ "username": "Jack", "age": 21 }`
- another point worth mentioning is that you must not use `,` trailing coma on the json body that you're trying to pass otherwise you'll get 400 code.
- what likely happened is that elysia seeing you with a trailing coma, expect you to put a different property which doesn't exist.
  - ```http
    POST {{baseUrl}}/echo
    Content-Type: application/json

    { "username": "Jack", "age": 21, } // this won't work because there's a trailing coma after `age` property.

    { "username": "Jack", "age": 21 } // this'll immediately work.
    ```

- note! `find()` returns a single `Task`.
- 100% COVERAGE LET'S FUCKING GOOO!!

| File          | % Funcs | % Lines | Uncovered Line #s |
| ------------- | ------- | ------- | ----------------- |
| All files     | 96.77   | 99.70   |
| index.test.ts | 93.55   | 99.40   | 225               |
| index2.ts     | 100.00  | 100.00  |

- check out [array-methods-operator](/docs/array-method.md) for more information about different rest api implementation and its reasoning
- don't forget to use `[]` square brackets if you have a `Type` or `interface` schema. it'll be useful for checking an array with type-safety.
- so far, i've understood how `spyOn` works. its easy to understand really, let me give an explanation in my own understanding here.
  - for `spyOn(Bun, 'file').mockReturnValue({})`
    - you're mocking a file here, this is the `getTask()` function equivalent.
    - so far, i've only used `.mockReturnValue()` so far, hoping to use more in the future.
  - as for `spyOn(Bun, 'write').mockResolvedValue()`
    - you're mocking writing to a file and you guessed it, its the equivalent of `saveTask()` function.
    - the number didn't matter, it was apparently just a mock byte or size.

- let me tell you what i learned about debugging using vs code debugger. it ain't much but this'd definitely help me catch some persistent bug.
- say it with me! http is so fucking easy, i know that swagger makes my life easier already but i think having a `.http` important because you'll be able to see what your server takes in a glance.
- you should definitely check your test coverage because its genuinely useful af, otherwise you wouldn't know whether your server was being covered 100% or not.
- now i could finally learn `.beforeHandle()` and `.afterHandle()` in peace.
- claude said that `.toBeObject()` and `.toBeArray()` are redundant in test runner when you already know the the exact shape and values of it.
- they're actually useful when you can't predict the exact content but still need to assert the shape
  - ```typescript
    // you don't know the exact task returned, but you need to assert it's an array
    expect(response).toBeArray();
    expect(response.length).toBeGreaterThan(0);

    // or asserting a response is an object without knowing all its fields
    expect(response).toBeObject();
    expect(response.id).toBeDefined();
    ```

- both shine more in a scenarios like testing a third-party api response or a database query where the exact content varies per run.
- i now get the point of why testing everything in your server matters, because looking at 100% coverage is so fucking satisfying
- in case you forgot, "handler" just means a function that handles a request, this function's job is to handle something.
- the order you write properties inside route object doesn't matter, you could write `body` before `beforeHandle` or after it, and it'll still works.
- schema validation (`body`, `query`, `params`) even runs as part of the pipeline too, before `beforeHandle`. so even if you write `body` last, it always validates before the hook fires.
- for `.onError()`checking. you don't need to define every error. just handle the specific ones you care about, blanket-catch the rest.
- `onError` only fires when something **throws**. if i do `if (!task) return { error: 'not found' }`, nothing threw. it'd just returned early. `onError` never sees it. practically handling it manually inside the route handler itself.
- if instead you do `if (!task) throw new Error('not found')`, now `onError` will catches it and formats it centrally.
- the diffence between letting your route handles error and `onError`:

  > with manual conditionals spread across every route, each one can return a slightly different shape. with `onError`, you throw anywhere and the formatting is guaranteed to be identical every time. there's only one place to change if you ever decided to restructure your whole error response.

- btw, you can safely switch from having a 404 route handler logic if you're using `onError`. that is, only if you explicitly delegate the **throwing** to `onError` instead of your route handler logic. `if (!task) throw new Error('not found')`
- didn't really learn much today because i only work on this project for an hour or so.
- hoping to get back in the game and finally complete this project, its been too long that i'm worried that i might get bored working on this project  pretty soon.
- hoping to finish this project asap.

# http status code cheat sheet

| code | meaning               | description                                     |
| ---- | --------------------- | ----------------------------------------------- |
| 200  | OK                    | request succeeded, response contains data.      |
| 201  | Created               | resource created successfully.                  |
| 204  | No Content            | request succeeded, no content returned.         |
| 400  | Bad Request           | client sent invalid request.                    |
| 401  | Unauthorized          | authentication required or failed.              |
| 403  | Forbidden             | server refuses to authorize request.            |
| 404  | Not Found             | resource not found.                             |
| 405  | Method Not Allowed    | http method not supported for resource.         |
| 409  | Conflict              | request conflicts with current state.           |
| 500  | Internal Server Error | server encountered an unexpected error.         |
| 502  | Bad Gateway           | invalid response from upstream server.          |
| 503  | Service Unavailable   | server is temporarily unable to handle request. |

for more codes, see [mdn web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

## find me

[portfolio](https://tgr-wjya.github.io) · [linkedin](https://linkedin.com/in/tegar-wijaya-kusuma-591a881b9) · [email](mailto:tgr.wjya.queue.top126@pm.me)

---

18 february - 2 march 2026

made with ◉‿◉
