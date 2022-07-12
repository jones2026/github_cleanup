package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/go-github/v45/github"
	"github.com/manifoldco/promptui"
	"golang.org/x/oauth2"
)

func main() {

	githubToken := os.Getenv("GITHUB_TOKEN")

	if len(githubToken) == 0 {
		log.Fatalln("No env var GITHUB_TOKEN found")
	}
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: githubToken},
	)
	tc := oauth2.NewClient(ctx, ts)

	client := github.NewClient(tc)

	repos, _, err := client.Repositories.List(ctx, "", nil)
	if err != nil {
		log.Fatalln(err)
	}

	for _, repo := range repos {
		if repo.GetFork() {
			fmt.Println("Delete:", *repo.Owner.Login, "/", *repo.Name, "?")
			if yesNo() {
				client.Repositories.Delete(context.Background(), *repo.Owner.Login, *repo.Name)
				fmt.Println("Deleted:", *repo.Owner.Login, "/", *repo.Name, "?")
			}

		}
	}

}

func yesNo() bool {
	prompt := promptui.Select{
		Label: "Select[Yes/No]",
		Items: []string{"Yes", "No"},
	}
	_, result, err := prompt.Run()
	if err != nil {
		log.Fatalf("Prompt failed %v\n", err)
	}
	return result == "Yes"
}
