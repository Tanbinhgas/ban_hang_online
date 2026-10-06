from flask import Flask, request, jsonify
from myapp.calculator import Calculator

app = Flask(__name__)
calc = Calculator()


@app.route("/")
def home():
    return "Hello from my-python-app running inside Docker!"


@app.route("/calculate")
def calculate():
    # Ví dụ: /calculate?op=add&a=5&b=3
    op = request.args.get("op", "add")
    a = float(request.args.get("a", 0))
    b = float(request.args.get("b", 0))

    if op == "add":
        result = calc.add(a, b)
    elif op == "subtract":
        result = calc.subtract(a, b)
    elif op == "multiply":
        result = calc.multiply(a, b)
    elif op == "divide":
        result = calc.divide(a, b)
    else:
        return jsonify({"error": "unknown operation"}), 400

    return jsonify({"operation": op, "a": a, "b": b, "result": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
