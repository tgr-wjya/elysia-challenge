# elysia rest api mastery

i completed 5 elysia rest api milestone project

## date

- day 5
- 18 - 19 february 2026
- week 1

## time spent

- session 1: 1 hours 25 mins
- session 2: 12 mins

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

## next project

- next project i'll be building a portfolio-kaomoji-api that i used on my portfolio site.
- yess, its a shame to admit this but i vibe-coded those project.
- but shame no more after i completed this project, i'd be able to take on those kaomoji rest api easily!

## honorary mention

nothing worth mentioning here.

## key takeaways

- all the takeaways already addressed in the [realization](#realization)
- i'll say mor if i have something to say obviously.

## find me

[portfolio](https://tgr-wjya.github.io) · [linkedin](https://linkedin.com/in/tegar-wijaya-kusuma-591a881b9) · [email](mailto:tgr.wjya.queue.top126@pm.me)

---

18 - 19 february 2026

made with ◉‿◉
