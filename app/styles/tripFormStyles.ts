import { StyleSheet } from "react-native";

const tripFormStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "semibold",
    marginBottom: 50,
    marginTop: 30,
    textAlign: "center",
    color: 'rgb(16, 89, 138)',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 15,
  },
  button_generate: {
    backgroundColor: "rgb(16, 89, 138)",
    padding: 10,
    borderRadius: 15,
  },
});

export default tripFormStyles;
