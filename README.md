# hirae

an exploration tracker designed to bring fun and whimsy to my daily life, because i don't want to succumb to the monotony of routine :)

places you've been fill in on the map like uncovering the map in a game, and each walk logs itself as a journal entry. still in progress!

## what it does

- **fog-of-war map:** the map starts gray, and wherever you walk fills in and stays filled
- **auto-logged walks:** it notices when you start and stop walking, skips car rides and tiny trips, and saves each walk to your journal with a name based on where you went
- **% explored:** shows how much of your city you've covered, using OpenStreetMap city boundaries
- **mock mode:** a button on the map fakes a walk around Georgia Tech, so you can see it work without leaving your room

## built with

Figma, Expo, React Native, TypeScript, Mapbox, Turf.js

## running it

Mapbox needs native code, so this runs as a dev build, not in Expo Go.

1. `npm install`
2. make a `.env` file with your Mapbox token:
   ```
   EXPO_PUBLIC_MAPBOX_TOKEN=your_token_here
   ```
3. `npx expo run:ios` or `npx expo run:android`

## coming up

- saving walks to Supabase instead of just on your phone
- state, country, and world exploration stats
- landmarks to collect along the way
