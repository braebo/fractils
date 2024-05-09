# Brainstorming

## Common API's

### Creating inputs / bindings

```ts
const params = {
    foo: 1,
    bar: 'baz'
};
```
<br>

#### [dat.gui](https://github.com/georgealways/lil-gui) + [lil-gui](https://github.com/georgealways/lil-gui)

```ts
gui.add(person, 'bar')
gui.add(person, 'foo', 0, 100);
```
<br>


### Select Inputs

#### [lil-gui](https://github.com/georgealways/lil-gui)

```ts
gui.add( myObject, 'myNumber', [ 0, 1, 2 ] );
gui.add( myObject, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 } );
```
<br>

Didn't spot these in the `dat.gui` docs.. but it could be there.
