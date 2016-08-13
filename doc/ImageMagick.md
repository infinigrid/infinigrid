# Creating maps using ImageMagick

## Restrict number of colors in image
```ImageMagick
$ convert <input> -colors 64 <output>
```

## Create color map
```ImageMagick
$ convert               \
  -size 60x60           \
  xc:"rgb(28,46,18)"    \
  xc:"rgb(79,78,59)"    \
  xc:"rgb(16,22,18)"    \
  xc:"rgb(1,5,19)"      \
  xc:"rgb(28,68,122)"   \
  xc:"rgb(198,162,118)" \
  xc:"rgb(224,224,221)" \
  xc:"rgb(119,124,126)" \
  xc:"rgb(146,150,152)" \
  +append colors.png
```

## Apply color map
```ImageMagick
$ convert           \
  <input>           \
  -remap colors.png \
  <output>
```

## Morphology
```ImageMagick
convert                        \
  <input>                      \
  -resize 2048                 \
  -remap colors.png            \
  -morphology Open Diamond:2   \
  -morphology Dilate Diamond:2 \
  -morphology Erode Diamond:2  \
  -remap colors.png            \
  <output>
```
