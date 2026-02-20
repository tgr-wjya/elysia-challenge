# elysia rest api mastery

i completed 5 elysia rest api milestone project

## date

- day 8
- 18 - 20 february 2026
- week 2

## time spent

- first session: 1 hours 25 mins
- second session: 3 hrs 36 mins
- third session: 17 mins
- fourth session: 2 hrs 32 mins
- total: **7 hours and 50 minutes**

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

-

## find me

[portfolio](https://tgr-wjya.github.io) · [linkedin](https://linkedin.com/in/tegar-wijaya-kusuma-591a881b9) · [email](mailto:tgr.wjya.queue.top126@pm.me)

---

18 - 21 february 2026

made with ◉‿◉
