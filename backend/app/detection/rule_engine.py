import os
import yaml


RULES_PATH = "app/rules/yaml"


class RuleEngine:

    def __init__(self):
        self.rules = self.load_rules()

    def load_rules(self):
        rules = []

        for file in os.listdir(RULES_PATH):
            if file.endswith(".yml") or file.endswith(".yaml"):

                with open(f"{RULES_PATH}/{file}", "r", encoding="utf-8") as f:
                    rule = yaml.safe_load(f)
                    rules.append(rule)

        return rules

    def match(self, log_text: str):

        log_text = log_text.lower()

        for rule in self.rules:

            for pattern in rule["patterns"]:

                if pattern.lower() in log_text:

                    return {
                        "detected": True,
                        "attack_type": rule["attack_type"],
                        "severity": rule["severity"],
                        "risk_score": rule["risk_score"],
                        "recommendations": rule["recommendations"],
                        "rule_name": rule["name"]
                    }

        return {
            "detected": False
        }