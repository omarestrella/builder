start = (surrounding_text / binding / incomplete_binding)*

binding = "{{" inner_code "}}" {
  return {
  	text: text(),
    location: location()
  }
}

inner_code = (!"{{" !"}}" .)+

// anything that doesnt start with braces
surrounding_text = $(!"{{" .)+

// started a brace binding but didnt balance
incomplete_binding = $("{{" (!("{{" / "}}") .)*)