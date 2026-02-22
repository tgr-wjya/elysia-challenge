# elysia rest api mastery

trying to complete elysia mastery challenge. the challenge consist of **restful api**, **type-safety**, **test runner** and **hooks**.

## date

- day 10
- 18 - 23 february 2026
- week 2

## time spent

- first session: 1 hours 25 mins
- second session: 3 hrs 36 mins
- third session: 17 mins
- fourth session: 2 hrs 32 mins
- fifth session: 3 hrs 34 mins
- sixth session: 1 hr 19 mins
- total: **12 hours and 43 minutes**

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
- test runner is actually easy as fuck, you're just validating what you've built and to avoid those incident..

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
  - apparently, in modern javascript/typescript. it’s often cleaner to "filter out" what you don't want rather than finding a position and "splicing" it out.
  - that's precisely why you're using `.filter()` and `!==` for `/DELETE`
  - for `/DELETE`
    - `.filter()` goes through every single item in the array and asks a `True/False` question: "should this item stay in the new list?"
    - `!==` (not equal to):
      - if true (it's a different id), the item stays.
      - if false (it's the id you want to delete), the item is dropped.
    - explanation from gemini: "For DELETE: It’s actually faster and less messy to just "re-deal" the deck without the unwanted card than it is to try and pull a card out of the middle and shove the rest of the cards together to fill the gap."
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

## find me

[portfolio](https://tgr-wjya.github.io) · [linkedin](https://linkedin.com/in/tegar-wijaya-kusuma-591a881b9) · [email](mailto:tgr.wjya.queue.top126@pm.me)

---

18 - 23 february 2026

made with ◉‿◉
