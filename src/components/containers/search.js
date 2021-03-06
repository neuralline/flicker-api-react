import React, { Component } from "react";
import { connect } from "react-redux";
import searchPhotos from "../../store/actions/search-photos-action";
import updateResultPage from "../../store/actions/update-result-action";
import BreadCrumbs from "../presentations/bread-crumbs";
import Loading from "../presentations/loading-bar";
import Photo from "../presentations/photo";
import { handleOnScroll } from "../utilities/functions";

class Search extends Component {
  state = {
    updating: 0,
    search: {
      method: 1,
      text: this.props.pageID,
      tags: "",
      page: this.props.page || 1
    }
  };

  infiniteScroll() {
    if (handleOnScroll()) {
      this.setState({ ...this.state, updating: 1 });
      this.props.updatePage(this.state.search);
    }
  }

  resetInfiniteScroll() {
    this.setState({ ...this.state, updating: 0 });
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", () => {});
  }

  componentDidMount() {
    this.props.getSearchResult({
      method: 1,
      text: this.props.pageID,
      tags: "",
      page: 1
    });

    window.onscroll = () => {
      if (!this.state.updating) return this.infiniteScroll();
    };

    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.page !== this.props.page) {
      this.resetInfiniteScroll();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.pageID) {
      this.setState({
        ...this.state,
        search: {
          method: 1,
          text: nextProps.match.params.id,
          tags: "",
          page: 1
        }
      });
      this.props.getSearchResult({
        method: 1,
        text: nextProps.match.params.id,
        tags: "",
        page: 1
      });
    }
  }

  render() {
    //handle connection error
    const connectionError = this.props.connectionError
      ? this.props.errorMessage
      : this.props.loadingMessage;

    //handle photos list
    const recent = this.props.result || [];
    const recentPhotoList = recent.length ? (
      recent.map(photo => {
        return (
          <div
            key={photo.id}
            className="col-xl-3 col-lg-4 col-md-6 col-sm-12 transition"
          >
            <Photo photo={photo} coverStyle="list" />
          </div>
        );
      })
    ) : (
      <div className="col-md-4">{connectionError}</div>
    );
    return (
      <div className="container">
        <BreadCrumbs message={"Search result for " + this.state.search.text} />
        <div className="row">{recentPhotoList}</div>
        <Loading />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    pageID: ownProps.match.params.id,
    result: state.photo,
    page: state.page,
    connectionError: state.connectionError,
    errorMessage: state.errorMessage,
    loadingMessage: state.loadingMessage
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSearchResult: data => dispatch(searchPhotos(data)),
    updatePage: data => dispatch(updateResultPage(data))
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);
