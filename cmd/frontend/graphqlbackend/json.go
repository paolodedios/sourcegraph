package graphqlbackend

import (
	"encoding/json"

	"github.com/sourcegraph/sourcegraph/lib/errors"
)

// JSONValue implements the JSONValue scalar type. In GraphQL queries, it is represented the JSON
// representation of its Go value.
// Note: we have both pointer and value receivers on this type, and we are fine with that.
type JSONValue struct{ Value any }

func (JSONValue) ImplementsGraphQLType(name string) bool {
	return name == "JSONValue"
}

func (v *JSONValue) UnmarshalGraphQL(input any) error {
	*v = JSONValue{Value: input}
	return nil
}

func (v JSONValue) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.Value)
}

func (v *JSONValue) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, &v.Value)
}

// JSONCString implements the JSONCString scalar type.
type JSONCString string

func (JSONCString) ImplementsGraphQLType(name string) bool {
	return name == "JSONCString"
}

func (j *JSONCString) UnmarshalGraphQL(input any) error {
	s, ok := input.(string)
	if !ok {
		return errors.Errorf("invalid GraphQL JSONCString scalar value input (got %T, expected string)", input)
	}
	*j = JSONCString(s)
	return nil
}

func (j JSONCString) MarshalJSON() ([]byte, error) {
	return json.Marshal(string(j))
}
