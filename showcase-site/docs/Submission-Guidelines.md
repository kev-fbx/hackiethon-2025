How to format your code:

Ensure that your React (jsx) file follows this structure:

```
# imports, such as...
import ... from ...

# define any constants here, such as...
const a = 1;

# define widget here:

const MyWidget = () => {
  # React code goes here, such as ..
  const [a, setA] = useState(0);

  # The widget needs to return a div, so:

  return (
    <div className="example-classname">
      # HTML portion of JSX

    </div>
  )

  # default export so that your widget can automatically render -- ensure that the name matches your widget name
  export default MyWidget;
}
```
A template will be provided in src/submission-widgets/

Expected directory structure:

```
/src                            # Main source code of project
│── /submission-widgets         # Place your widget and extra files here
    │── MyWidget.jsx            # Your widget file
    │── MyAssets                # A folder to store any of your assets
        │── img1.png
        │── logo.svg
        │── etc
    │── MyWidget.css            # Your widget's CSS, if needed
```

**We highly recommend using TailwindCSS for styling your component, and discourage using CSS files, due to naming clashes in CSS classes.**

